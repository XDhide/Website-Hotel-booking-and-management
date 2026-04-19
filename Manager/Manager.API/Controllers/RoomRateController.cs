using System.Linq;
using System.Threading.Tasks;
using Manager.API.Dtos.RoomRate;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/roomrate")]
    [ApiController]
    public class RoomRateController : ControllerBase
    {
        private readonly IRoomRateRepository _roomRateRepository;

        public RoomRateController(IRoomRateRepository roomRateRepository)
        {
            _roomRateRepository = roomRateRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _roomRateRepository.GetAllAsync(page, limit);
            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No RoomRate found.");
            var dtos = result.Data.Select(s => s.ToRoomRateDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _roomRateRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No RoomRate found with id " + id + ".");
            return Ok(model.ToRoomRateDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(int RoomTypeId, CreateRoomRateRequestDto dto)
        {
            var model = dto.ToCreateRoomRateModel();
            var created = await _roomRateRepository.CreateAsync(RoomTypeId, model);
            var resultDto = created.ToRoomRateDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.RoomRateId }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateRoomRateRequestDto dto)
        {
            var updated = await _roomRateRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No RoomRate found with id " + id + ".");
            return Ok(updated.ToRoomRateDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _roomRateRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No RoomRate found with id " + id + ".");
            return Ok(deleted.ToRoomRateDto());
        }
    }
}
