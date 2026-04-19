using System.Linq;
using System.Threading.Tasks;
using Manager.API.Dtos.Messenger;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/messenger")]
    [ApiController]
    public class MessengerController : ControllerBase
    {
        private readonly IMessengerRepository _messengerRepository;

        public MessengerController(IMessengerRepository messengerRepository)
        {
            _messengerRepository = messengerRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _messengerRepository.GetAllAsync(page, limit);
            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No Messenger found.");
            var dtos = result.Data.Select(s => s.ToMessengerDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _messengerRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No Messenger found with id " + id + ".");
            return Ok(model.ToMessengerDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(string UserId, int MessengerBoxId, CreateMessengerRequestDto dto)
        {
            var model = dto.ToCreateMessengerModel();
            var created = await _messengerRepository.CreateAsync(UserId, MessengerBoxId, model);
            var resultDto = created.ToMessengerDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.Id }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateMessengerRequestDto dto)
        {
            var updated = await _messengerRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No Messenger found with id " + id + ".");
            return Ok(updated.ToMessengerDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _messengerRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No Messenger found with id " + id + ".");
            return Ok(deleted.ToMessengerDto());
        }
    }
}
