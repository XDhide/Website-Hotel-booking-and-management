using System.Linq;
using System.Threading.Tasks;
using Manager.API.Dtos.RoomInUse;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/roominuse")]
    [ApiController]
    public class RoomInUseController : ControllerBase
    {
        private readonly IRoomInUseRepository _roomInUseRepository;

        public RoomInUseController(IRoomInUseRepository roomInUseRepository)
        {
            _roomInUseRepository = roomInUseRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _roomInUseRepository.GetAllAsync(page, limit);
            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No RoomInUse found.");
            var dtos = result.Data.Select(s => s.ToRoomInUseDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _roomInUseRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No RoomInUse found with id " + id + ".");
            return Ok(model.ToRoomInUseDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(int RoomsId, int BookingId, CreateRoomInUseRequestDto dto)
        {
            var model = dto.ToCreateRoomInUseModel();
            var created = await _roomInUseRepository.CreateAsync(RoomsId, BookingId, model);
            var resultDto = created.ToRoomInUseDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.RoomUseId }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateRoomInUseRequestDto dto)
        {
            var updated = await _roomInUseRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No RoomInUse found with id " + id + ".");
            return Ok(updated.ToRoomInUseDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _roomInUseRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No RoomInUse found with id " + id + ".");
            return Ok(deleted.ToRoomInUseDto());
        }
    }
}
