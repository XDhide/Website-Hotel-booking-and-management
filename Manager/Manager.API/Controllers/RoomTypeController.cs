using System.Linq;
using System.Threading.Tasks;
using Manager.API.Dtos.RoomType;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/roomtype")]
    [ApiController]
    public class RoomTypeController : ControllerBase
    {
        private readonly IRoomTypeRepository _roomTypeRepository;

        public RoomTypeController(IRoomTypeRepository roomTypeRepository)
        {
            _roomTypeRepository = roomTypeRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _roomTypeRepository.GetAllAsync(page, limit);
            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No RoomType found.");
            var dtos = result.Data.Select(s => s.ToRoomTypeDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _roomTypeRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No RoomType found with id " + id + ".");
            return Ok(model.ToRoomTypeDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(CreateRoomTypeRequestDto dto)
        {
            var model = dto.ToCreateRoomTypeModel();
            var created = await _roomTypeRepository.CreateAsync(model);
            var resultDto = created.ToRoomTypeDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.Id }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateRoomTypeRequestDto dto)
        {
            var updated = await _roomTypeRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No RoomType found with id " + id + ".");
            return Ok(updated.ToRoomTypeDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _roomTypeRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No RoomType found with id " + id + ".");
            return Ok(deleted.ToRoomTypeDto());
        }
    }
}
