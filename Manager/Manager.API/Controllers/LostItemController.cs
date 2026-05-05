using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.LostItem;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Manager.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Controllers
{
    [Route("api/lostitem")]
    [ApiController]
    public class LostItemController : ControllerBase
    {
        private readonly ILostItemRepository _lostItemRepository;
        private readonly ApplicationDBContext _db;

        public LostItemController(ILostItemRepository lostItemRepository, ApplicationDBContext db)
        {
            _lostItemRepository = lostItemRepository;
            _db = db;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
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

        [HttpGet("my-lostitem")]
        [Authorize]
        public async Task<IActionResult> GetMyLostItems()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var roomUseIds = await _db.Bookings
                .Where(b => b.UserId == userId)
                .SelectMany(b => b.RoomInUses.Select(r => (int?)r.RoomUseId))
                .ToListAsync();

            var items = await _db.LostItems
                .Include(l => l.Rooms)
                .Where(l => l.RoomUseId != null && roomUseIds.Contains(l.RoomUseId))
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            return Ok(items.Select(l => new
            {
                l.LostItemId,
                l.ItemName,
                l.Description,
                l.FoundAt,
                l.Status,
                l.CreatedAt,
                RoomNumber = l.Rooms?.RoomNumber,
                l.RoomId,
                l.RoomUseId,
            }));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateLostItemRequestDto dto)
        {
            var model = dto.ToCreateLostItemModel();
            var created = await _lostItemRepository.CreateAsync(
                dto.RoomId ?? 0, dto.RoomUseId ?? 0, model);
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
