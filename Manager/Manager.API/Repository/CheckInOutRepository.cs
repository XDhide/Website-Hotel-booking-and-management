using System;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.CheckInOut;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class CheckInOutRepository : ICheckInOutRepository
    {
        private readonly ApplicationDBContext _db;

        public CheckInOutRepository(ApplicationDBContext db)
        {
            _db = db;
        }

        // ─── CHECK IN ────────────────────────────────────────────────────────────

        public async Task<CheckInOutResultDto> CheckInAsync(int bookingId)
        {
            var booking = await _db.Bookings
                .Include(b => b.RoomInUses)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null)
                throw new Exception($"Booking {bookingId} không tìm thấy.");

            if (booking.Status == "CheckedIn")
                throw new Exception("Booking này đã được check-in rồi.");

            if (booking.Status == "Cancelled")
                throw new Exception("Booking đã bị huỷ, không thể check-in.");

            // Tìm RoomInUse đang chờ (nếu có) hoặc tự tạo
            var roomInUse = booking.RoomInUses?.FirstOrDefault(r => r.Status == "Pending");

            if (roomInUse != null)
            {
                roomInUse.CheckInActual = DateTime.Now;
                roomInUse.Status        = "Active";
            }

            booking.Status = "CheckedIn";

            await _db.SaveChangesAsync();

            return new CheckInOutResultDto
            {
                BookingId  = bookingId,
                Status     = "CheckedIn",
                Message    = "Check-in thành công.",
                ActualDate = DateTime.Now,
            };
        }

        // ─── CHECK OUT ───────────────────────────────────────────────────────────

        public async Task<CheckInOutResultDto> CheckOutAsync(int bookingId)
        {
            var booking = await _db.Bookings
                .Include(b => b.RoomInUses)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null)
                throw new Exception($"Booking {bookingId} không tìm thấy.");

            if (booking.Status != "CheckedIn")
                throw new Exception("Booking chưa check-in, không thể check-out.");

            // Đóng tất cả RoomInUse đang Active
            var activeRooms = booking.RoomInUses?
                .Where(r => r.Status == "Active")
                .ToList();

            if (activeRooms != null)
            {
                foreach (var room in activeRooms)
                {
                    room.CheckOutActual = DateTime.Now;
                    room.Status         = "Completed";
                }
            }

            booking.Status = "CheckedOut";

            await _db.SaveChangesAsync();

            return new CheckInOutResultDto
            {
                BookingId  = bookingId,
                Status     = "CheckedOut",
                Message    = "Check-out thành công.",
                ActualDate = DateTime.Now,
            };
        }

        // ─── TRANSFER ROOM ───────────────────────────────────────────────────────

        public async Task<CheckInOutResultDto> TransferRoomAsync(int bookingId, int newRoomId)
        {
            var booking = await _db.Bookings
                .Include(b => b.RoomInUses)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null)
                throw new Exception($"Booking {bookingId} không tìm thấy.");

            var newRoom = await _db.Rooms.FindAsync(newRoomId);
            if (newRoom == null)
                throw new Exception($"Phòng {newRoomId} không tìm thấy.");

            if (newRoom.CurrentStatus != "Available")
                throw new Exception("Phòng mới không khả dụng để chuyển.");

            // Đóng RoomInUse hiện tại
            var current = booking.RoomInUses?
                .FirstOrDefault(r => r.Status == "Active");

            if (current != null)
            {
                // Đánh dấu phòng cũ là Available
                var oldRoom = await _db.Rooms.FindAsync(current.RoomId);
                if (oldRoom != null)
                    oldRoom.CurrentStatus = "Available";

                current.CheckOutActual = DateTime.Now;
                current.Status         = "Transferred";
            }

            // Tạo RoomInUse mới
            var newRoomInUse = new RoomInUse
            {
                BookingId      = bookingId,
                RoomId         = newRoomId,
                CheckInActual  = DateTime.Now,
                Status         = "Active",
                CreatedAt      = DateTime.Now,
            };

            newRoom.CurrentStatus = "Occupied";

            await _db.RoomInUses.AddAsync(newRoomInUse);
            await _db.SaveChangesAsync();

            return new CheckInOutResultDto
            {
                BookingId  = bookingId,
                Status     = "Transferred",
                Message    = $"Chuyển sang phòng {newRoom.RoomNumber} thành công.",
                ActualDate = DateTime.Now,
            };
        }

        // ─── EXTEND BOOKING ──────────────────────────────────────────────────────

        public async Task<CheckInOutResultDto> ExtendBookingAsync(
            int bookingId, DateTime newCheckOutDate)
        {
            var booking = await _db.Bookings.FindAsync(bookingId);

            if (booking == null)
                throw new Exception($"Booking {bookingId} không tìm thấy.");

            if (newCheckOutDate <= booking.ToDate)
                throw new Exception("Ngày trả phòng mới phải sau ngày trả phòng hiện tại.");

            booking.ToDate = newCheckOutDate;

            await _db.SaveChangesAsync();

            return new CheckInOutResultDto
            {
                BookingId  = bookingId,
                Status     = "Extended",
                Message    = $"Gia hạn đến {newCheckOutDate:yyyy-MM-dd} thành công.",
                ActualDate = newCheckOutDate,
            };
        }
    }
}
