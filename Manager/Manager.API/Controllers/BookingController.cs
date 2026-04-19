using System.Linq;
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
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _bookingRepository.GetAllAsync(page, limit);
            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No Booking found.");
            var dtos = result.Data.Select(s => s.ToBookingDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _bookingRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No Booking found with id " + id + ".");
            return Ok(model.ToBookingDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(string UserId, int RoomTypeId, CreateBookingRequestDto dto)
        {
            var model = dto.ToCreateBookingModel();
            var created = await _bookingRepository.CreateAsync(UserId, RoomTypeId, model);
            var resultDto = created.ToBookingDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.Id }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateBookingRequestDto dto)
        {
            var updated = await _bookingRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No Booking found with id " + id + ".");
            return Ok(updated.ToBookingDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _bookingRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No Booking found with id " + id + ".");
            return Ok(deleted.ToBookingDto());
        }
    }
}
