using Manager.API.Dtos.Room;
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
        private readonly RoomRepository _roomRepository;
        public RoomController(RoomRepository roomRepository)
        {
            _roomRepository = roomRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var roomModels = await _roomRepository.GetAllAsync();
            if (roomModels == null || roomModels.Count == 0)
            {
                return NotFound("No Room found.");
            }
            var roomDtos = roomModels.Select(s => s.ToRoomDto());
            return Ok(roomDtos);
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
