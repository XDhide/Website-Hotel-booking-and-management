using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.RoomInUse;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class RoomInUseRepository : IRoomInUseRepository
    {
        private readonly ApplicationDBContext _dBContext;

        public RoomInUseRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public async Task<RoomInUse> CreateAsync(int RoomsId, int BookingId, RoomInUse model)
        {
            var rooms = await _dBContext.Rooms.FirstOrDefaultAsync(s => s.RoomId == RoomsId);
            if (rooms == null)
                throw new Exception("Rooms not found");

            var booking = await _dBContext.Bookings.FirstOrDefaultAsync(s => s.Id == BookingId);
            if (booking == null)
                throw new Exception("Booking not found");

            var newModel = new RoomInUse
            {
                BookingId = model.BookingId,
                RoomId = model.RoomId,
                RentType = model.RentType,
                CheckInActual = model.CheckInActual,
                CheckOutActual = model.CheckOutActual,
                PricePerUnit = model.PricePerUnit,
                TotalAmount = model.TotalAmount,
                Status = model.Status,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
            };
            await _dBContext.RoomInUses.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();
            return newModel;
        }

        public async Task<RoomInUse> DeleteAsync(int id)
        {
            var model = await _dBContext.RoomInUses.FirstOrDefaultAsync(s => s.RoomUseId == id);
            if (model == null)
                return null;
            _dBContext.RoomInUses.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<RoomInUse>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.RoomInUses.AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query.OrderByDescending(r => r.RoomUseId).Skip((page - 1) * limit).Take(limit).ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<RoomInUse>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<RoomInUse> GetByIdAsync(int id)
        {
            return await _dBContext.RoomInUses.FindAsync(id);
        }

        public async Task<RoomInUse> UpdateAsync(int id, UpdateRoomInUseRequestDto dto)
        {
            var model = await _dBContext.RoomInUses.FirstOrDefaultAsync(s => s.RoomUseId == id);
            if (model == null)
                return null;
            var rooms = await _dBContext.Rooms.FirstOrDefaultAsync(s => s.RoomId == dto.RoomId);
            if (rooms == null)
                throw new Exception("Rooms not found");
            var booking = await _dBContext.Bookings.FirstOrDefaultAsync(s => s.Id == dto.BookingId);
            if (booking == null)
                throw new Exception("Booking not found");
            model.BookingId = dto.BookingId;
            model.RoomId = dto.RoomId;
            model.RentType = dto.RentType;
            model.CheckInActual = dto.CheckInActual;
            model.CheckOutActual = dto.CheckOutActual;
            model.PricePerUnit = dto.PricePerUnit;
            model.TotalAmount = dto.TotalAmount;
            model.Status = dto.Status;
            model.CreatedAt = dto.CreatedAt;
            model.UpdatedAt = DateTime.Now;
            await _dBContext.SaveChangesAsync();
            return model;
        }
    }
}
