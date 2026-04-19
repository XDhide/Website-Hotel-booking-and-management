using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.Booking;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class BookingRepository : IBookingRepository
    {
        private readonly ApplicationDBContext _dBContext;

        public BookingRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public async Task<Booking> CreateAsync(string UserId, int RoomTypeId, Booking model)
        {
            var user = await _dBContext.Users.FirstOrDefaultAsync(s => s.Id == UserId);
            if (user == null)
                throw new Exception("User not found");

            var roomType = await _dBContext.RoomTypes.FirstOrDefaultAsync(s => s.Id == RoomTypeId);
            if (roomType == null)
                throw new Exception("RoomType not found");

            var newModel = new Booking
            {
                UserId = UserId,              
                RoomTypeId = RoomTypeId,      
                Deposit = model.Deposit,
                FromDate = model.FromDate,
                ToDate = model.ToDate,
                Status = model.Status,
                CreatedAt = DateTime.Now
            };

            await _dBContext.Bookings.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();
            return newModel;
        }

        public async Task<Booking> DeleteAsync(int id)
        {
            var model = await _dBContext.Bookings.FirstOrDefaultAsync(s => s.Id == id);
            if (model == null)
                return null;
            _dBContext.Bookings.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<Booking>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.Bookings.AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query.OrderByDescending(r => r.Id).Skip((page - 1) * limit).Take(limit).ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<Booking>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<Booking> GetByIdAsync(int id)
        {
            return await _dBContext.Bookings.FindAsync(id);
        }

        public async Task<Booking> UpdateAsync(int id, UpdateBookingRequestDto dto)
        {
            var model = await _dBContext.Bookings.FirstOrDefaultAsync(s => s.Id == id);
            if (model == null)
                return null;
            var user = await _dBContext.Users.FirstOrDefaultAsync(s => s.Id == dto.UserId);
            if (user == null)
                throw new Exception("User not found");
            var roomType = await _dBContext.RoomTypes.FirstOrDefaultAsync(s => s.Id == dto.RoomTypeId);
            if (roomType == null)
                throw new Exception("RoomType not found");
            model.UserId = dto.UserId;
            model.RoomTypeId = dto.RoomTypeId;
            model.Deposit = dto.Deposit;
            model.FromDate = dto.FromDate;
            model.ToDate = dto.ToDate;
            model.Status = dto.Status;
            model.CreatedAt = dto.CreatedAt;
            await _dBContext.SaveChangesAsync();
            return model;
        }
    }
}
