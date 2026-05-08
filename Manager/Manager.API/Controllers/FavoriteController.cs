using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Manager.API.Dtos.Favorite;
using Manager.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/Favorite")]
    [ApiController]
    [Authorize]
    public class FavoriteController : ControllerBase
    {
        private readonly IFavoriteRepository _favoriteRepository;

        public FavoriteController(IFavoriteRepository favoriteRepository)
        {
            _favoriteRepository = favoriteRepository;
        }

        private string GetUserId() =>
            User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            try
            {
                var favorites = await _favoriteRepository.GetFavoritesAsync(GetUserId());
                return Ok(favorites);
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpGet("ids")]
        public async Task<IActionResult> GetFavoriteIds()
        {
            try
            {
                var ids = await _favoriteRepository.GetFavoriteIdsAsync(GetUserId());
                return Ok(ids);
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPost]
        public async Task<IActionResult> AddFavorite([FromBody] AddFavoriteRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var result = await _favoriteRepository.AddFavoriteAsync(GetUserId(), dto.RoomTypeId);
                if (result == null) return NotFound("Loại phòng không tồn tại.");
                return Ok(result);
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpDelete("{roomTypeId:int}")]
        public async Task<IActionResult> RemoveFavorite(int roomTypeId)
        {
            try
            {
                var removed = await _favoriteRepository.RemoveFavoriteAsync(GetUserId(), roomTypeId);
                if (!removed) return NotFound("Không tìm thấy yêu thích.");
                return Ok(new { message = "Đã xóa khỏi yêu thích." });
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("toggle/{roomTypeId:int}")]
        public async Task<IActionResult> ToggleFavorite(int roomTypeId)
        {
            try
            {
                var userId = GetUserId();
                var isFav  = await _favoriteRepository.IsFavoriteAsync(userId, roomTypeId);

                if (isFav)
                {
                    await _favoriteRepository.RemoveFavoriteAsync(userId, roomTypeId);
                    return Ok(new { liked = false, message = "Đã xóa khỏi yêu thích." });
                }
                else
                {
                    var result = await _favoriteRepository.AddFavoriteAsync(userId, roomTypeId);
                    if (result == null) return NotFound("Loại phòng không tồn tại.");
                    return Ok(new { liked = true, message = "Đã thêm vào yêu thích.", data = result });
                }
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }
    }
}
