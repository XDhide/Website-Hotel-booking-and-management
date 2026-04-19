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
        public async Task<Services> CreateAsync(Services Services)
        {
            await _dBContext.Services.AddAsync(Services);
            await _dBContext.SaveChangesAsync();
            return Services;
        }

        public async Task<Services?> DeleteAsync(int id)
        {
            var services = await _dBContext.Services.FindAsync(id);
            if (services == null)
            {
                return null;
            }
            _dBContext.Services.Remove(services);
            await _dBContext.SaveChangesAsync();
            return services;
        }

        public async Task<PagedResult<Services>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            var query = _dBContext.Services.AsQueryable();

            var totalCount = await query.CountAsync();

            var data = await query
                .OrderBy(s => s.Id) 
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            var totalPages = totalCount == 0
                ? 0
                : (int)Math.Ceiling((double)totalCount / limit);

            return new PagedResult<Services>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<Services?> GetByIdAsync(int id)
        {
            var services = await _dBContext.Services.FindAsync(id);
            return services;
        }

        public async Task<Services?> UpdateAsync(int id, UpdateServicesRequestDto ServicesDto)
        {
            var services = await _dBContext.Services.FindAsync(id);
            if (services == null)
            {
                return null;
            }
            services.Name = ServicesDto.Name;
            services.Price = ServicesDto.Price;
            services.unit = ServicesDto.unit;
            services.ServiceType = ServicesDto.ServiceType;
            services.UpdateAt = DateTime.Now;

            await _dBContext.SaveChangesAsync();
            return services;
        }
    }
}
