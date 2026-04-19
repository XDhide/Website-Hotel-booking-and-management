using System.Linq;
using System.Threading.Tasks;
using Manager.API.Dtos.MessengerBox;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/messengerbox")]
    [ApiController]
    public class MessengerBoxController : ControllerBase
    {
        private readonly IMessengerBoxRepository _messengerBoxRepository;

        public MessengerBoxController(IMessengerBoxRepository messengerBoxRepository)
        {
            _messengerBoxRepository = messengerBoxRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _messengerBoxRepository.GetAllAsync(page, limit);
            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No MessengerBox found.");
            var dtos = result.Data.Select(s => s.ToMessengerBoxDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _messengerBoxRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No MessengerBox found with id " + id + ".");
            return Ok(model.ToMessengerBoxDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(string UserId, CreateMessengerBoxRequestDto dto)
        {
            var model = dto.ToCreateMessengerBoxModel();
            var created = await _messengerBoxRepository.CreateAsync(UserId, model);
            var resultDto = created.ToMessengerBoxDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.Id }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateMessengerBoxRequestDto dto)
        {
            var updated = await _messengerBoxRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No MessengerBox found with id " + id + ".");
            return Ok(updated.ToMessengerBoxDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _messengerBoxRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No MessengerBox found with id " + id + ".");
            return Ok(deleted.ToMessengerBoxDto());
        }
    }
}
