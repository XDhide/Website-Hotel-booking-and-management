using Manager.API.Dtos.RoomType;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Manager.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/RoomType")]
    [ApiController]
    public class RoomTypeController : ControllerBase
    {
        private readonly IRoomTypeRepository _RoomTypeRepository;
        public RoomTypeController(IRoomTypeRepository RoomTypeRepository)
        {
            _RoomTypeRepository = RoomTypeRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _RoomTypeRepository.GetAllAsync(page, limit);

            if (result.Data == null || result.Data.Count == 0)
            {
                return NotFound("No RoomType found.");
            }

            var roomTypeDtos = result.Data
                .Select(s => s.ToRoomTypeDto())
                .ToList();

            return Ok(new
            {
                result.Page,
                result.Limit,
                result.TotalCount,
                result.TotalPages,
                data = roomTypeDtos
            });
        }
        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var RoomTypeModel = await _RoomTypeRepository.GetByIdAsync(id);
            if (RoomTypeModel == null)
            {
                return NotFound($"No RoomType found with id {id}.");
            }
            var RoomTypeDto = RoomTypeModel.ToRoomTypeDto();
            return Ok(RoomTypeDto);

        }
        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(CreateRoomTypeRequestDto createRoomTypeRequestDto)
        {
            var RoomTypeModel = createRoomTypeRequestDto.ToRoomTypeCreateDto();
            var createdRoomType = await _RoomTypeRepository.CreateAsync(RoomTypeModel);
            var RoomTypeDto = createdRoomType.ToRoomTypeDto();
            return CreatedAtAction(nameof(GetById), new { id = RoomTypeDto.Id }, RoomTypeDto);
        }
        [HttpPut]
        [Route("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateRoomTypeRequestDto updateRoomTypeRequestDto)
        {
            var updatedRoomType = await _RoomTypeRepository.UpdateAsync(id, updateRoomTypeRequestDto);
            if (updatedRoomType == null)
            {
                return NotFound($"No RoomType found with id {id}.");
            }
            var RoomTypeDto = updatedRoomType.ToRoomTypeDto();
            return Ok(RoomTypeDto);
        }
        [HttpDelete]
        [Route("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deletedRoomType = await _RoomTypeRepository.DeleteAsync(id);
            if (deletedRoomType == null)
            {
                return NotFound($"No RoomType found with id {id}.");
            }
            var RoomTypeDto = deletedRoomType.ToRoomTypeDto();
            return Ok(RoomTypeDto);
        }
    }
}