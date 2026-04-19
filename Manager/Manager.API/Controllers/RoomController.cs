using Manager.API.Dtos.Room;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Manager.API.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/room")]
    [ApiController]
    public class RoomController : ControllerBase
    {
        private readonly IRoomRepository _roomRepository;

        public RoomController(IRoomRepository roomRepository)
        {
            _roomRepository = roomRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _roomRepository.GetAllAsync(page, limit);

            if (result.Data == null || result.Data.Count == 0)
            {
                return NotFound("No Room found.");
            }

            var roomDtos = result.Data
                .Select(s => s.ToRoomDto())
                .ToList();

            return Ok(new
            {
                result.Page,
                result.Limit,
                result.TotalCount,
                result.TotalPages,
                data = roomDtos
            });
        }
        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var roomModel = await _roomRepository.GetByIdAsync(id);
            if (roomModel == null)
            {
                return NotFound($"No Room found with id {id}.");
            }
            var roomDto = roomModel.ToRoomDto();
            return Ok(roomDto);
        }
        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(int IdRoomType, CreateRoomRequestDto createRoomRequestDto)
        {
            var roomModel = createRoomRequestDto.ToCreateRoomDto();
            var createdRoom = await _roomRepository.CreateAsync(IdRoomType, roomModel);
            var roomDto = createdRoom.ToRoomDto();
            return CreatedAtAction(nameof(GetById), new { id = roomDto.Id }, roomDto);
        }   

        [HttpPut]
        [Route("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateRoomRequestDto updateRoomRequestDto)
        {
            var updatedRoom = await _roomRepository.UpdateAsync(id, updateRoomRequestDto);
            if (updatedRoom == null)
            {
                return NotFound($"No Room found with id {id}.");
            }
            var roomDto = updatedRoom.ToRoomDto();
            return Ok(roomDto);
        }
         [HttpDelete]
         [Route("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
            {
            var deletedRoom = await _roomRepository.DeleteAsync(id);
            if (deletedRoom == null)
            {
                return NotFound($"No Room found with id {id}.");
            }
            var roomDto = deletedRoom.ToRoomDto();
            return Ok(roomDto);
        }
    }
}
