using System.IdentityModel.Tokens.Jwt;
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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _bookingRepository.GetByIdAsync(id);

            if (model == null)
                return NotFound($"No Booking found with id {id}.");

            return Ok(model.ToBookingDto());
        }

        [HttpGet("my-bookings")]
        [Authorize]
        public async Task<IActionResult> GetMyBookings()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var bookings = await _bookingRepository.GetByUserIdAsync(userId);

            var dtos = bookings.Select(b => b.ToBookingDto()).ToList();

            return Ok(dtos);
        }

        /// <summary>
        /// User tự đặt phòng: yêu cầu cọc, tự động tìm phòng trống
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Manager,User")]
        public async Task<IActionResult> Create([FromBody] CreateBookingRequestDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                      ?? dto.UserId;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Không xác định được người dùng.");

            dto.UserId = userId;

            if (dto.FromDate == null || dto.ToDate == null)
                return BadRequest("Vui lòng chọn ngày nhận và trả phòng.");

            if (dto.ToDate <= dto.FromDate)
                return BadRequest("Ngày trả phòng phải sau ngày nhận phòng.");

            // User tự đặt: yêu cầu deposit > 0
            bool isAdmin = User.IsInRole("Admin") || User.IsInRole("Manager");
            if (!isAdmin && (dto.Deposit == null || dto.Deposit <= 0))
            {
                dto.Deposit = null; // sẽ được tính tự động
            }

            try
            {
                var model = dto.ToCreateBookingModel();
                var created = await _bookingRepository.CreateAsync(dto.UserId, dto.RoomTypeId, model);
                var result = created.ToBookingDto();
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Admin tạo booking: không cọc, chọn loại phòng cụ thể
        /// </summary>
        [HttpPost("admin-create")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> AdminCreate([FromBody] CreateBookingRequestDto dto)
        {
            if (string.IsNullOrEmpty(dto.UserId))
                return BadRequest("Cần cung cấp UserId.");

            if (dto.FromDate == null || dto.ToDate == null)
                return BadRequest("Vui lòng chọn ngày nhận và trả phòng.");

            if (dto.ToDate <= dto.FromDate)
                return BadRequest("Ngày trả phòng phải sau ngày nhận phòng.");

            // Admin đặt: deposit = 0
            dto.Deposit = 0;

            try
            {
                var model = dto.ToCreateBookingModel();
                var created = await _bookingRepository.CreateAsync(dto.UserId, dto.RoomTypeId, model);
                var result = created.ToBookingDto();
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateBookingRequestDto dto)
        {
            var updated = await _bookingRepository.UpdateAsync(id, dto);

            if (updated == null)
                return NotFound($"No Booking found with id {id}.");

            return Ok(updated.ToBookingDto());
        }

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
