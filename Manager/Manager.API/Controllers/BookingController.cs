using Manager.API.Dtos.Booking;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Manager.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly IBookingRepository _bookingRepo;
        private readonly IRoomRepository _roomRepo;
        private readonly IRoomRateRepository _roomRateRepo;
        private readonly UserManager<AppUser> _userManager;

        public BookingController(
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

        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetAll()
        {
            var bookings = await _bookingRepo.GetAllAsync();
            var bookingDtos = bookings.Select(b => b.ToBookingDto());
            return Ok(bookingDtos);
        }

        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var booking = await _bookingRepo.GetByIdAsync(id);
            if (booking == null)
                return NotFound("Booking not found");

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            // Check if user owns this booking or is admin/manager
            if (booking.UserId != user.Id && !User.IsInRole("Admin") && !User.IsInRole("Manager"))
                return Forbid();

            return Ok(booking.ToBookingDto());
        }

        [HttpGet("my-bookings")]
        [Authorize]
        public async Task<IActionResult> GetMyBookings()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var bookings = await _bookingRepo.GetByUserIdAsync(user.Id);
            var bookingDtos = bookings.Select(b => b.ToBookingDto());
            return Ok(bookingDtos);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateBookingRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            // Kiểm tra phòng tồn tại và có sẵn
            var room = await _roomRepo.GetByIdAsync(dto.RoomId);
            if (room == null)
                return NotFound("Room not found");

            if (room.CurrentStatus != "Available")
                return BadRequest("Room is not available");

            // Kiểm tra ngày tháng hợp lệ
            if (dto.CheckInDate >= dto.CheckOutDate)
                return BadRequest("Check-out date must be after check-in date");

            if (dto.CheckInDate < DateTime.Now.Date)
                return BadRequest("Check-in date cannot be in the past");

            var booking = dto.ToBookingFromCreate(user.Id);
            
            // Tính tổng tiền dựa trên giá phòng
            var days = (dto.CheckOutDate - dto.CheckInDate).Days;
            var roomRate = await _roomRateRepo.GetByRoomTypeIdAsync(room.RoomTypeId);
            if (roomRate != null)
            {
                booking.TotalAmount = roomRate.Price * days;
            }

            var createdBooking = await _bookingRepo.CreateAsync(booking);
            return CreatedAtAction(nameof(GetById), new { id = createdBooking.Id }, createdBooking.ToBookingDto());
        }

        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateBookingRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var booking = await _bookingRepo.GetByIdAsync(id);
            if (booking == null)
                return NotFound("Booking not found");

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            // Kiểm tra quyền sở hữu booking hoặc là admin/manager
            if (booking.UserId != user.Id && !User.IsInRole("Admin") && !User.IsInRole("Manager"))
                return Forbid();

            // Chỉ có thể cập nhật booking đang chờ hoặc đã xác nhận
            if (booking.Status != "Pending" && booking.Status != "Confirmed")
                return BadRequest("Cannot update booking in current status");

            if (dto.CheckInDate.HasValue)
                booking.CheckInDate = dto.CheckInDate.Value;

            if (dto.CheckOutDate.HasValue)
                booking.CheckOutDate = dto.CheckOutDate.Value;

            if (dto.NumberOfGuests.HasValue)
                booking.NumberOfGuests = dto.NumberOfGuests.Value;

            if (dto.SpecialRequests != null)
                booking.SpecialRequests = dto.SpecialRequests;

            // Tính lại tổng tiền nếu ngày thay đổi
            if (dto.CheckInDate.HasValue || dto.CheckOutDate.HasValue)
            {
                var days = (booking.CheckOutDate - booking.CheckInDate).Days;
                var room = await _roomRepo.GetByIdAsync(booking.RoomId);
                if (room != null)
                {
                    var roomRate = await _roomRateRepo.GetByRoomTypeIdAsync(room.RoomTypeId);
                    if (roomRate != null)
                    {
                        booking.TotalAmount = roomRate.Price * days;
                    }
                }
            }

            var updatedBooking = await _bookingRepo.UpdateAsync(id, booking);
            return Ok(updatedBooking?.ToBookingDto());
        }

        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Cancel([FromRoute] int id)
        {
            var booking = await _bookingRepo.GetByIdAsync(id);
            if (booking == null)
                return NotFound("Booking not found");

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            // Kiểm tra quyền sở hữu booking hoặc là admin/manager
            if (booking.UserId != user.Id && !User.IsInRole("Admin") && !User.IsInRole("Manager"))
                return Forbid();

            // Chỉ có thể hủy booking đang chờ hoặc đã xác nhận
            if (booking.Status != "Pending" && booking.Status != "Confirmed")
                return BadRequest("Cannot cancel booking in current status");

            booking.Status = "Cancelled";
            await _bookingRepo.UpdateAsync(id, booking);

            // Cập nhật trạng thái phòng về có sẵn
            var room = await _roomRepo.GetByIdAsync(booking.RoomId);
            if (room != null && room.CurrentStatus == "Reserved")
            {
                room.CurrentStatus = "Available";
                await _roomRepo.UpdateAsync(booking.RoomId, room);
            }

            return Ok(new { message = "Booking cancelled successfully" });
        }
    }
}
