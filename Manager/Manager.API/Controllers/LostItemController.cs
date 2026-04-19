using Manager.API.Dtos.LostItem;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/LostItem")]
    [ApiController]
    public class LostItemController : ControllerBase
    {
        private readonly ILostItemRepository _lostItemRepository;
        public LostItemController(ILostItemRepository lostItemRepository)
        {
            _lostItemRepository = lostItemRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _lostItemRepository.GetAllAsync(page, limit);

            if (result.Data == null || result.Data.Count == 0)
                return NotFound("No lost items found.");

            var dtos = result.Data
                .Select(i => i.ToLostItemDto())
                .ToList();

            return Ok(new
            {
                result.Page,
                result.Limit,
                result.TotalCount,
                result.TotalPages,
                data = dtos
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _lostItemRepository.GetByIdAsync(id);
            if (item == null)
                return NotFound($"No lost item found with id {id}.");
            return Ok(item.ToLostItemDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(CreateLostItemDto dto)
        {
            var item = dto.ToLostItem();
            var created = await _lostItemRepository.CreateAsync(item);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created.ToLostItemDto());
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateLostItemDto dto)
        {
            var updated = await _lostItemRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound($"No lost item found with id {id}.");
            return Ok(updated.ToLostItemDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _lostItemRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound($"No lost item found with id {id}.");
            return Ok(deleted.ToLostItemDto());
        }
    }
}