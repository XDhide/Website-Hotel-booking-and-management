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

        /// <summary>
        /// CheckIn: Đổi trạng thái booking -> CheckedIn, phòng -> Occupied,
        /// roomInUse -> Active, và TẠO INVOICE mới (Unpaid) + InvoiceDetail cho phòng.
        /// </summary>
        public async Task<CheckInOutResultDto> CheckInAsync(int bookingId)
        {
            var booking = await _db.Bookings
                .Include(b => b.RoomInUses)
                .Include(b => b.RoomType)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null)
                throw new Exception($"Booking {bookingId} không tìm thấy.");
            if (booking.Status == "CheckedIn")
                throw new Exception("Booking này đã được check-in rồi.");
            if (booking.Status == "Cancelled")
                throw new Exception("Booking đã bị huỷ, không thể check-in.");

            var roomInUse = booking.RoomInUses?.FirstOrDefault(r => r.Status == "Pending");

            if (roomInUse == null)
                throw new Exception("Không tìm thấy RoomInUse đang chờ cho booking này.");

            // Đổi phòng sang Occupied
            var room = await _db.Rooms.FindAsync(roomInUse.RoomId);
            if (room != null)
            {
                room.CurrentStatus = "Occupied";
                room.UpdatedAt = DateTime.Now;
            }

            roomInUse.CheckInActual = DateTime.Now;
            roomInUse.Status = "Active";
            booking.Status = "CheckedIn";

            await _db.SaveChangesAsync();

            // Tìm RoomRate phù hợp cho loại phòng
            var roomRate = await _db.RoomRates
                .Where(rr => rr.RoomTypeId == booking.RoomTypeId && rr.IsActive == true)
                .OrderByDescending(rr => rr.RoomRateId)
                .FirstOrDefaultAsync();
            double pricePerUnit = roomRate?.Price ?? 0;

            // Tính số đêm
            double nights = 0;
            if (booking.FromDate.HasValue && booking.ToDate.HasValue)
                nights = Math.Max(1, (booking.ToDate.Value - booking.FromDate.Value).TotalDays);
            double roomTotal = pricePerUnit * nights;

            // TẠO INVOICE mới (Unpaid) - chỉ tạo lúc check-in
            var invoice = new Invoice
            {
                RoomUseId = roomInUse.RoomUseId,
                UserId = booking.UserId,
                SubTotal = 0,
                DiscountAmount = 0,
                SurchargeAmount = 0,
                FinalAmount = 0,
                PaymentStatus = "Unpaid",
                PaymentMethod = "",
                Note = $"Hóa đơn tự động - Booking #{bookingId}",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
            };
            await _db.Invoices.AddAsync(invoice);
            await _db.SaveChangesAsync();

            // Tạo InvoiceDetail đầu tiên: tiền phòng
            var roomTypeName = booking.RoomType?.Name ?? $"Phòng #{room?.RoomNumber}";
            var invoiceDetail = new InvoiceDetail
            {
                InvoiceId = invoice.InvoiceId,
                ItemType = "Room",
                ItemId = roomInUse.RoomId.ToString(),
                ItemName = $"{roomTypeName} - Phòng {room?.RoomNumber} ({nights} đêm)",
                UnitPrice = pricePerUnit,
                Quantity = nights,
                TotalPrice = roomTotal,
                CreatedAt = DateTime.Now,
            };
            await _db.InvoiceDetails.AddAsync(invoiceDetail);

            // Update roomInUse amounts
            roomInUse.PricePerUnit = pricePerUnit;
            roomInUse.TotalAmount = roomTotal;

            await _db.SaveChangesAsync();

            return new CheckInOutResultDto
            {
                BookingId = bookingId,
                Status = "CheckedIn",
                Message = $"Check-in thành công. Hóa đơn #{invoice.InvoiceId} đã được tạo.",
                ActualDate = DateTime.Now,
            };
        }

        public async Task<CheckInOutResultDto> CheckOutAsync(int bookingId)
        {
            var booking = await _db.Bookings
                .Include(b => b.RoomInUses)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null)
                throw new Exception($"Booking {bookingId} không tìm thấy.");
            if (booking.Status != "CheckedIn")
                throw new Exception("Booking chưa check-in, không thể check-out.");

            var activeRooms = booking.RoomInUses?
                .Where(r => r.Status == "Active").ToList();

            if (activeRooms != null)
            {
                foreach (var r in activeRooms)
                {
                    r.CheckOutActual = DateTime.Now;
                    r.Status = "Completed";

                    var room = await _db.Rooms.FindAsync(r.RoomId);
                    if (room != null)
                    {
                        room.CurrentStatus = "Available";
                        room.UpdatedAt = DateTime.Now;
                    }
                }
            }

            booking.Status = "Completed";
            await _db.SaveChangesAsync();

            return new CheckInOutResultDto
            {
                BookingId = bookingId,
                Status = "Completed",
                Message = "Check-out thành công.",
                ActualDate = DateTime.Now,
            };
        }

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

            var current = booking.RoomInUses?.FirstOrDefault(r => r.Status == "Active");
            if (current != null)
            {
                var oldRoom = await _db.Rooms.FindAsync(current.RoomId);
                if (oldRoom != null) { oldRoom.CurrentStatus = "Available"; oldRoom.UpdatedAt = DateTime.Now; }
                current.CheckOutActual = DateTime.Now;
                current.Status = "Transferred";
            }

            var newRIU = new RoomInUse
            {
                BookingId = bookingId, RoomId = newRoomId,
                CheckInActual = DateTime.Now, Status = "Active", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now,
            };
            newRoom.CurrentStatus = "Occupied"; newRoom.UpdatedAt = DateTime.Now;
            await _db.RoomInUses.AddAsync(newRIU);
            await _db.SaveChangesAsync();

            return new CheckInOutResultDto { BookingId = bookingId, Status = "Transferred", Message = $"Chuyển sang phòng {newRoom.RoomNumber} thành công.", ActualDate = DateTime.Now };
        }

        public async Task<CheckInOutResultDto> ExtendBookingAsync(int bookingId, DateTime newCheckOutDate)
        {
            var booking = await _db.Bookings.FindAsync(bookingId);
            if (booking == null) throw new Exception($"Booking {bookingId} không tìm thấy.");
            if (newCheckOutDate <= booking.ToDate) throw new Exception("Ngày mới phải sau ngày hiện tại.");
            booking.ToDate = newCheckOutDate;
            await _db.SaveChangesAsync();
            return new CheckInOutResultDto { BookingId = bookingId, Status = "Extended", Message = $"Gia hạn đến {newCheckOutDate:yyyy-MM-dd} thành công.", ActualDate = newCheckOutDate };
        }
    }
}
