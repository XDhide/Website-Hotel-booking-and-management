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

        public async Task<List<Booking>> GetByUserIdAsync(string userId)
        {
            return await _dBContext.Bookings
                .Include(b => b.RoomType)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<Booking> CreateAsync(string UserId, int RoomTypeId, Booking model)
        {
            var user = await _dBContext.Users.FirstOrDefaultAsync(s => s.Id == UserId);
            if (user == null) throw new Exception("User not found");

            var roomType = await _dBContext.RoomTypes
                .Include(rt => rt.Rooms)
                .FirstOrDefaultAsync(s => s.Id == RoomTypeId);
            if (roomType == null) throw new Exception("RoomType not found");

            bool isAdminBooking = model.Deposit == null || model.Deposit == 0;

            // Tìm phòng Available
            var availableRoom = roomType.Rooms?.FirstOrDefault(r => r.CurrentStatus == "Available");
            if (availableRoom == null)
                throw new Exception("Không còn phòng trống cho loại phòng này.");

            // Đánh dấu phòng là Pending
            availableRoom.CurrentStatus = "Pending";
            availableRoom.UpdatedAt = DateTime.Now;

            var newModel = new Booking
            {
                UserId = UserId,
                RoomTypeId = RoomTypeId,
                Deposit = isAdminBooking ? 0 : model.Deposit,
                FromDate = model.FromDate,
                ToDate = model.ToDate,
                Status = "Pending",
                CreatedAt = DateTime.Now
            };

            await _dBContext.Bookings.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();

            // Tạo RoomInUse với Status = "Pending" (chưa checkin)
            var roomInUse = new RoomInUse
            {
                BookingId = newModel.Id,
                RoomId = availableRoom.RoomId,
                RentType = "Night",
                CheckInActual = null,   // chưa checkin
                CheckOutActual = null,
                PricePerUnit = 0,       // sẽ được tính lúc checkin
                TotalAmount = 0,
                Status = "Pending",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
            };
            await _dBContext.RoomInUses.AddAsync(roomInUse);
            await _dBContext.SaveChangesAsync();

            // KHÔNG tạo Invoice ở đây. Invoice chỉ tạo khi CheckIn.

            return newModel;
        }

        public async Task<Booking> DeleteAsync(int id)
        {
            var model = await _dBContext.Bookings.FirstOrDefaultAsync(s => s.Id == id);
            if (model == null) return null;

            var roomInUse = await _dBContext.RoomInUses
                .FirstOrDefaultAsync(r => r.BookingId == id && r.Status == "Pending");
            if (roomInUse != null)
            {
                var room = await _dBContext.Rooms.FindAsync(roomInUse.RoomId);
                if (room != null) { room.CurrentStatus = "Available"; room.UpdatedAt = DateTime.Now; }
            }

            _dBContext.Bookings.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<Booking>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.Bookings.Include(b => b.RoomType).AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query.OrderByDescending(r => r.Id).Skip((page - 1) * limit).Take(limit).ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<Booking> { Page = page, Limit = limit, TotalCount = totalCount, TotalPages = totalPages, Data = data };
        }

        public async Task<Booking> GetByIdAsync(int id)
        {
            return await _dBContext.Bookings
                .Include(b => b.RoomType)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<Booking> UpdateAsync(int id, UpdateBookingRequestDto dto)
        {
            var model = await _dBContext.Bookings.FirstOrDefaultAsync(s => s.Id == id);
            if (model == null) return null;
            var user = await _dBContext.Users.FirstOrDefaultAsync(s => s.Id == dto.UserId);
            if (user == null) throw new Exception("User not found");
            var roomType = await _dBContext.RoomTypes.FirstOrDefaultAsync(s => s.Id == dto.RoomTypeId);
            if (roomType == null) throw new Exception("RoomType not found");
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
