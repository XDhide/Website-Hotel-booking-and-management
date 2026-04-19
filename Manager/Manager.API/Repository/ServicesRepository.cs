using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.Services;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class ServicesRepository : IServicesRepository
    {
        private readonly ApplicationDBContext _dBContext;

        public ServicesRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public async Task<Services> CreateAsync(Services model)
        {
            var newModel = new Services
            {
                ServiceType = model.ServiceType,
                Name = model.Name,
                Price = model.Price,
                Unit = model.Unit,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
            };
            await _dBContext.Services.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();
            return newModel;
        }

        public async Task<Services> DeleteAsync(int id)
        {
            var model = await _dBContext.Services.FirstOrDefaultAsync(s => s.Id == id);
            if (model == null)
                return null;
            _dBContext.Services.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<Services>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.Services.AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query.OrderByDescending(r => r.Id).Skip((page - 1) * limit).Take(limit).ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<Services>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<Services> GetByIdAsync(int id)
        {
            return await _dBContext.Services.FindAsync(id);
        }

        public async Task<Services> UpdateAsync(int id, UpdateServicesRequestDto dto)
        {
            var model = await _dBContext.Services.FirstOrDefaultAsync(s => s.Id == id);
            if (model == null)
                return null;
            model.ServiceType = dto.ServiceType;
            model.Name = dto.Name;
            model.Price = dto.Price;
            model.Unit = dto.Unit;
            model.CreatedAt = DateTime.Now;
            model.UpdatedAt = DateTime.Now;
            await _dBContext.SaveChangesAsync();
            return model;
        }
    }
}
