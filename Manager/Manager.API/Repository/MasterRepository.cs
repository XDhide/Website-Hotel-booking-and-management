using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.Master;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class MasterRepository : IMasterRepository
    {
        private readonly ApplicationDBContext _dBContext;

        public MasterRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public async Task<Master> CreateAsync(Master model)
        {
            var newModel = new Master
            {
                Name = model.Name,
                Content = model.Content,
                CreatedAt = DateTime.Now,
                UpdatedAt = model.UpdatedAt,
            };
            await _dBContext.Masters.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();
            return newModel;
        }

        public async Task<Master> DeleteAsync(int id)
        {
            var model = await _dBContext.Masters.FirstOrDefaultAsync(s => s.Id == id);
            if (model == null)
                return null;
            _dBContext.Masters.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<Master>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.Masters.AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query.OrderByDescending(r => r.Id).Skip((page - 1) * limit).Take(limit).ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<Master>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<Master> GetByIdAsync(int id)
        {
            return await _dBContext.Masters.FindAsync(id);
        }

        public async Task<Master> UpdateAsync(int id, UpdateMasterRequestDto dto)
        {
            var model = await _dBContext.Masters.FirstOrDefaultAsync(s => s.Id == id);
            if (model == null)
                return null;
            model.Name = dto.Name;
            model.Content = dto.Content;
            model.CreatedAt = dto.CreatedAt;
            model.UpdatedAt = DateTime.Now;
            await _dBContext.SaveChangesAsync();
            return model;
        }
    }
}
