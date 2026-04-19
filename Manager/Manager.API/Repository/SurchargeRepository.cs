using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.Surcharge;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class SurchargeRepository : ISurchargeRepository
    {
        private readonly ApplicationDBContext _dBContext;

        public SurchargeRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public async Task<Surcharge> CreateAsync(Surcharge model)
        {
            var newModel = new Surcharge
            {
                Name = model.Name,
                Price = model.Price,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
            };
            await _dBContext.Surcharges.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();
            return newModel;
        }

        public async Task<Surcharge> DeleteAsync(int id)
        {
            var model = await _dBContext.Surcharges.FirstOrDefaultAsync(s => s.Id == id);
            if (model == null)
                return null;
            _dBContext.Surcharges.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<Surcharge>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.Surcharges.AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query.OrderByDescending(r => r.Id).Skip((page - 1) * limit).Take(limit).ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<Surcharge>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<Surcharge> GetByIdAsync(int id)
        {
            return await _dBContext.Surcharges.FindAsync(id);
        }

        public async Task<Surcharge> UpdateAsync(int id, UpdateSurchargeRequestDto dto)
        {
            var model = await _dBContext.Surcharges.FirstOrDefaultAsync(s => s.Id == id);
            if (model == null)
                return null;
            model.Name = dto.Name;
            model.Price = dto.Price;
            model.CreatedAt = dto.CreatedAt;
            model.UpdatedAt = DateTime.Now;
            await _dBContext.SaveChangesAsync();
            return model;
        }
    }
}
