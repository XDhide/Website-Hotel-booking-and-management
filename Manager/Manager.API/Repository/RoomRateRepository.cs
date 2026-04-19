using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.RoomRate;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class RoomRateRepository : IRoomRateRepository
    {
        private readonly ApplicationDBContext _dBContext;

        public RoomRateRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public async Task<RoomRate> CreateAsync(int RoomTypeId, RoomRate model)
        {
            var roomType = await _dBContext.RoomTypes.FirstOrDefaultAsync(s => s.Id == RoomTypeId);
            if (roomType == null)
                throw new Exception("RoomType not found");

            var newModel = new RoomRate
            {
                RoomTypeId = model.RoomTypeId,
                RentType = model.RentType,
                Price = model.Price,
                FromDate = model.FromDate,
                ToDate = model.ToDate,
                IsActive = model.IsActive,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
            };
            await _dBContext.RoomRates.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();
            return newModel;
        }

        public async Task<RoomRate> DeleteAsync(int id)
        {
            var model = await _dBContext.RoomRates.FirstOrDefaultAsync(s => s.RoomRateId == id);
            if (model == null)
                return null;
            _dBContext.RoomRates.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<RoomRate>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.RoomRates.AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query.OrderByDescending(r => r.RoomRateId).Skip((page - 1) * limit).Take(limit).ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<RoomRate>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<RoomRate> GetByIdAsync(int id)
        {
            return await _dBContext.RoomRates.FindAsync(id);
        }

        public async Task<RoomRate> UpdateAsync(int id, UpdateRoomRateRequestDto dto)
        {
            var model = await _dBContext.RoomRates.FirstOrDefaultAsync(s => s.RoomRateId == id);
            if (model == null)
                return null;
            var roomType = await _dBContext.RoomTypes.FirstOrDefaultAsync(s => s.Id == dto.RoomTypeId);
            if (roomType == null)
                throw new Exception("RoomType not found");
            model.RoomTypeId = dto.RoomTypeId;
            model.RentType = dto.RentType;
            model.Price = dto.Price;
            model.FromDate = dto.FromDate;
            model.ToDate = dto.ToDate;
            model.IsActive = dto.IsActive;
            model.CreatedAt = dto.CreatedAt;
            model.UpdatedAt = DateTime.Now;
            await _dBContext.SaveChangesAsync();
            return model;
        }
    }
}
