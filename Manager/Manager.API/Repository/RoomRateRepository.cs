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
        public async Task<RoomRate> CreateAsync(int RoomTypeId, RoomRate RoomRate)
        {
            var roomType = _dBContext.RoomTypes.FirstOrDefaultAsync(s => s.Id == RoomTypeId );
            if (roomType == null)
            {
                throw new Exception("RoomType not found");
            }
            var newRoomRate = new RoomRate
            {
                RoomTypeId = RoomTypeId,
                RentType = RoomRate.RentType,
                Price = RoomRate.Price,
                FromDate = RoomRate.FromDate,
                ToDate = RoomRate.ToDate,
                IsActive = RoomRate.IsActive,
                CreateAt = DateTime.Now
            };
            await _dBContext.RoomRates.AddAsync(newRoomRate);
            await _dBContext.SaveChangesAsync();
            return newRoomRate;
        }

        public async Task<RoomRate?> DeleteAsync(int id)
        {
            var roomRate = await _dBContext.RoomRates.FirstOrDefaultAsync(s => s.Id == id);
            if (roomRate == null)
            {
                return null;
            }
            _dBContext.RoomRates.Remove(roomRate);
            await _dBContext.SaveChangesAsync();
            return roomRate;
        }

        public async Task<PagedResult<RoomRate>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            var query = _dBContext.RoomRates.AsQueryable();

            var totalCount = await query.CountAsync();

            var data = await query
                .OrderByDescending(r => r.Id) 
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            var totalPages = totalCount == 0
                ? 0
                : (int)Math.Ceiling((double)totalCount / limit);

            return new PagedResult<RoomRate>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<RoomRate?> GetByIdAsync(int id)
        {
            var roomRate = await _dBContext.RoomRates.FindAsync(id);
            return roomRate;
        }

        public async Task<RoomRate?> GetByRoomTypeIdAsync(int roomTypeId)
        {
            var roomRate = await _dBContext.RoomRates
                .Where(rr => rr.RoomTypeId == roomTypeId && rr.IsActive)
                .OrderByDescending(rr => rr.CreateAt)
                .FirstOrDefaultAsync();
            return roomRate;
        }

        public async Task<RoomRate?> UpdateAsync(int id, UpdateRoomRateRequestDto RoomRateDto)
        {
            var roomRate = await _dBContext.RoomRates.FirstOrDefaultAsync(s => s.Id == id);
            if (roomRate == null)
            {
                return null;
            }
            roomRate.RentType = RoomRateDto.RentType;
            roomRate.Price = RoomRateDto.Price;
            roomRate.FromDate = RoomRateDto.FromDate;
            roomRate.ToDate = RoomRateDto.ToDate;
            roomRate.IsActive = RoomRateDto.IsActive;
            roomRate.UpdateAt = DateTime.Now;
            
            await _dBContext.SaveChangesAsync();
            return roomRate;
        }
    }
}
