using System.Linq;
using System.Threading.Tasks;
using Manager.API.Dtos.Rooms;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/rooms")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly IRoomsRepository _roomsRepository;

        public RoomsController(IRoomsRepository roomsRepository)
        {
            _roomsRepository = roomsRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _roomsRepository.GetAllAsync(page, limit);
            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No Rooms found.");
            var dtos = result.Data.Select(s => s.ToRoomsDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _roomsRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No Rooms found with id " + id + ".");
            return Ok(model.ToRoomsDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(int RoomTypeId, CreateRoomsRequestDto dto)
        {
            var model = dto.ToCreateRoomsModel();
            var created = await _roomsRepository.CreateAsync(RoomTypeId, model);
            var resultDto = created.ToRoomsDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.RoomId }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateRoomsRequestDto dto)
        {
            var updated = await _roomsRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No Rooms found with id " + id + ".");
            return Ok(updated.ToRoomsDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _roomsRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No Rooms found with id " + id + ".");
            return Ok(deleted.ToRoomsDto());
        }
    }
}
