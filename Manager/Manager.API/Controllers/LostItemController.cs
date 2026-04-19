using System.Linq;
using System.Threading.Tasks;
using Manager.API.Dtos.LostItem;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/lostitem")]
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
                return NotFound("No LostItem found.");
            var dtos = result.Data.Select(s => s.ToLostItemDto()).ToList();
            return Ok(new { result.Page, result.Limit, result.TotalCount, result.TotalPages, data = dtos });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var model = await _lostItemRepository.GetByIdAsync(id);
            if (model == null)
                return NotFound("No LostItem found with id " + id + ".");
            return Ok(model.ToLostItemDto());
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create(int RoomsId, int RoomInUseId, CreateLostItemRequestDto dto)
        {
            var model = dto.ToCreateLostItemModel();
            var created = await _lostItemRepository.CreateAsync(RoomsId, RoomInUseId, model);
            var resultDto = created.ToLostItemDto();
            return CreatedAtAction(nameof(GetById), new { id = resultDto.LostItemId }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, UpdateLostItemRequestDto dto)
        {
            var updated = await _lostItemRepository.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound("No LostItem found with id " + id + ".");
            return Ok(updated.ToLostItemDto());
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _lostItemRepository.DeleteAsync(id);
            if (deleted == null)
                return NotFound("No LostItem found with id " + id + ".");
            return Ok(deleted.ToLostItemDto());
        }
    }
}
