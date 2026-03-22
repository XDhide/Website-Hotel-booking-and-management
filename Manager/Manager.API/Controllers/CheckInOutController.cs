using Manager.API.Dtos.CheckInOut;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Manager")]
    public class CheckInOutController : ControllerBase
    {
        private readonly IBookingRepository _bookingRepo;
        private readonly IRoomRepository _roomRepo;
        private readonly IRoomRateRepository _roomRateRepo;
        private readonly UserManager<AppUser> _userManager;

        public CheckInOutController(
            IBookingRepository bookingRepo,
            IRoomRepository roomRepo,
            IRoomRateRepository roomRateRepo,
            UserManager<AppUser> userManager)
        {
            _bookingRepo = bookingRepo;
            _roomRepo = roomRepo;
            _roomRateRepo = roomRateRepo;
            _userManager = userManager;
        }

        [HttpPost("checkin")]
        public async Task<IActionResult> CheckIn([FromBody] CheckInRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var booking = await _bookingRepo.GetByIdAsync(dto.BookingId);
            if (booking == null)
                return NotFound("Booking not found");

            if (booking.Status != "Confirmed")
                return BadRequest("Only confirmed bookings can be checked in");

            if (booking.CheckInDate.Date > DateTime.Now.Date)
                return BadRequest("Check-in date has not arrived yet");

            // Cập nhật trạng thái booking
            booking.Status = "CheckedIn";
            await _bookingRepo.UpdateAsync(dto.BookingId, booking);

            // Cập nhật trạng thái phòng
            var room = await _roomRepo.GetByIdAsync(booking.RoomId);
            if (room != null)
            {
                room.CurrentStatus = "Occupied";
                await _roomRepo.UpdateAsync(booking.RoomId, room);
            }

            return Ok(new { message = "Check-in successful", bookingId = booking.Id });
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> CheckOut([FromBody] CheckOutRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var booking = await _bookingRepo.GetByIdAsync(dto.BookingId);
            if (booking == null)
                return NotFound("Booking not found");

            if (booking.Status != "CheckedIn")
                return BadRequest("Only checked-in bookings can be checked out");

            // Cập nhật trạng thái booking
            booking.Status = "CheckedOut";
            await _bookingRepo.UpdateAsync(dto.BookingId, booking);

            // Cập nhật trạng thái phòng
            var room = await _roomRepo.GetByIdAsync(booking.RoomId);
            if (room != null)
            {
                room.CurrentStatus = "Cleaning";
                await _roomRepo.UpdateAsync(booking.RoomId, room);
            }

            return Ok(new { 
                message = "Check-out successful", 
                bookingId = booking.Id,
                totalAmount = booking.TotalAmount
            });
        }

        [HttpPost("transfer-room")]
        public async Task<IActionResult> TransferRoom([FromBody] TransferRoomRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var booking = await _bookingRepo.GetByIdAsync(dto.BookingId);
            if (booking == null)
                return NotFound("Booking not found");

            if (booking.Status != "CheckedIn")
                return BadRequest("Only checked-in bookings can transfer rooms");

            var newRoom = await _roomRepo.GetByIdAsync(dto.NewRoomId);
            if (newRoom == null)
                return NotFound("New room not found");

            if (newRoom.CurrentStatus != "Available")
                return BadRequest("New room is not available");

            // Cập nhật trạng thái phòng cũ
            var oldRoom = await _roomRepo.GetByIdAsync(booking.RoomId);
            if (oldRoom != null)
            {
                oldRoom.CurrentStatus = "Cleaning";
                await _roomRepo.UpdateAsync(booking.RoomId, oldRoom);
            }

            // Cập nhật booking với phòng mới
            booking.RoomId = dto.NewRoomId;
            await _bookingRepo.UpdateAsync(dto.BookingId, booking);

            // Cập nhật trạng thái phòng mới
            newRoom.CurrentStatus = "Occupied";
            await _roomRepo.UpdateAsync(dto.NewRoomId, newRoom);

            return Ok(new { 
                message = "Room transfer successful", 
                oldRoomId = oldRoom?.Id,
                newRoomId = newRoom.Id
            });
        }

        [HttpPost("extend")]
        public async Task<IActionResult> ExtendBooking([FromBody] ExtendBookingRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var booking = await _bookingRepo.GetByIdAsync(dto.BookingId);
            if (booking == null)
                return NotFound("Booking not found");

            if (booking.Status != "CheckedIn")
                return BadRequest("Only checked-in bookings can be extended");

            if (dto.NewCheckOutDate <= booking.CheckOutDate)
                return BadRequest("New check-out date must be after current check-out date");

            // Tính tiền phát sinh thêm
            var additionalDays = (dto.NewCheckOutDate - booking.CheckOutDate).Days;
            var room = await _roomRepo.GetByIdAsync(booking.RoomId);
            if (room != null)
            {
                var roomRate = await _roomRateRepo.GetByRoomTypeIdAsync(room.RoomTypeId);
                if (roomRate != null)
                {
                    var additionalAmount = roomRate.Price * additionalDays;
                    booking.TotalAmount += additionalAmount;
                }
            }

            booking.CheckOutDate = dto.NewCheckOutDate;
            await _bookingRepo.UpdateAsync(dto.BookingId, booking);

            return Ok(new { 
                message = "Booking extended successfully",
                newCheckOutDate = booking.CheckOutDate,
                newTotalAmount = booking.TotalAmount
            });
        }
    }
}
