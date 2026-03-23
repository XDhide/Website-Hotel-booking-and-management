using Manager.API.Dtos.RoomRate;
using Manager.API.Mappers;
using Manager.API.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/RoomRate")]
    [ApiController]
    public class RoomRateController : ControllerBase
    {
        private readonly RoomRateRepository _roomRateRepository;
        public RoomRateController(RoomRateRepository roomRateRepository)
        {
            _roomRateRepository = roomRateRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var roomRateModels = await _roomRateRepository.GetAllAsync();
            if (roomRateModels == null || roomRateModels.Count == 0)
            {
                return NotFound("No RoomRate found.");
            }
            var roomRateDtos = roomRateModels.Select(s => s.ToRoomRateDto());
            return Ok(roomRateModels);
        }
        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var roomRateModel = await _roomRateRepository.GetByIdAsync(id);
            if (roomRateModel == null)
            {
                return NotFound($"No RoomRate found with id {id}.");
            }
            var roomRateDto = roomRateModel.ToRoomRateDto();
            return Ok(roomRateDto);
        }
        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(int IdRoomType, CreateRoomRateRequestDto createRoomRateRequestDto)
        {
            var roomRateModel = createRoomRateRequestDto.ToCreateRoomRateDto();
            var createdRoomRate = await _roomRateRepository.CreateAsync(IdRoomType, roomRateModel);
            var roomRateDto = createdRoomRate.ToRoomRateDto();
            return CreatedAtAction(nameof(GetById), new { id = roomRateDto.Id }, roomRateDto);
        }
        [HttpPut]
        [Route("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateRoomRateRequestDto updateRoomRateRequestDto)
        {
            var updatedRoomRate = await _roomRateRepository.UpdateAsync(id, updateRoomRateRequestDto);
            if (updatedRoomRate == null)
            {
                return NotFound($"No RoomRate found with id {id}.");
            }
            var roomRateDto = updatedRoomRate.ToRoomRateDto();
            return Ok(roomRateDto);
        }
        [HttpDelete]
        [Route("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deletedRoomRate = await _roomRateRepository.DeleteAsync(id);
            if (deletedRoomRate == null)
            {
                return NotFound($"No RoomRate found with id {id}.");
            }
            var roomRateDto = deletedRoomRate.ToRoomRateDto();
            return Ok(roomRateDto);
        }
    }
}
