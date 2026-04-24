using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Manager.API.Dtos.Booking;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/booking")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly IBookingRepository _bookingRepository;

        public BookingController(IBookingRepository bookingRepository)
        {
            _bookingRepository = bookingRepository;
        }

        // ─── GET ALL (admin) ─────────────────────────────────────────────────────

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _bookingRepository.GetAllAsync(page, limit);

            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No Booking found.");

            var dtos = result.Data.Select(s => s.ToBookingDto()).ToList();

            return Ok(new
            {
                result.Page,
                result.Limit,
                result.TotalCount,
                result.TotalPages,
                data = dtos,
            });
        }

        // ─── GET BY ID ───────────────────────────────────────────────────────────

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _bookingRepository.GetByIdAsync(id);

            if (model == null)
                return NotFound($"No Booking found with id {id}.");

            return Ok(model.ToBookingDto());
        }

        // ─── MY BOOKINGS ─────────────────────────────────────────────────────────

        /// <summary>
        /// GET /api/booking/my-bookings
        /// Trả về danh sách booking của user đang đăng nhập.
        /// </summary>
        [HttpGet("my-bookings")]
        [Authorize]
        public async Task<IActionResult> GetMyBookings()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // Gọi method mới trong repository (xem BookingRepository_Extension.cs)
            var bookings = await _bookingRepository.GetByUserIdAsync(userId);

            var dtos = bookings.Select(b => b.ToBookingDto()).ToList();

            return Ok(dtos);
        }

        // ─── CREATE ──────────────────────────────────────────────────────────────

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(
            string UserId, int RoomTypeId, CreateBookingRequestDto dto)
        {
            var model = dto.ToCreateBookingModel();
            var created = await _bookingRepository.CreateAsync(UserId, RoomTypeId, model);
            var result = created.ToBookingDto();

            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        // ─── UPDATE ──────────────────────────────────────────────────────────────

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateBookingRequestDto dto)
        {
            var updated = await _bookingRepository.UpdateAsync(id, dto);

            if (updated == null)
                return NotFound($"No Booking found with id {id}.");

            return Ok(updated.ToBookingDto());
        }

        // ─── DELETE ──────────────────────────────────────────────────────────────

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _bookingRepository.DeleteAsync(id);

            if (deleted == null)
                return NotFound($"No Booking found with id {id}.");

            return Ok(deleted.ToBookingDto());
        }
    }
}
