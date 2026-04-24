using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Manager.API.Dtos.Profile;
using Manager.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/Profile")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileRepository _profileRepository;

        public ProfileController(IProfileRepository profileRepository)
        {
            _profileRepository = profileRepository;
        }

        // Lấy userId từ JWT token hiện tại
        private string GetCurrentUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        // ─── GET PROFILE ─────────────────────────────────────────────────────────

        /// <summary>
        /// GET /api/Profile
        /// Trả về thông tin profile của user đang đăng nhập.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = GetCurrentUserId();
                var profile = await _profileRepository.GetProfileAsync(userId);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ─── UPDATE PROFILE ──────────────────────────────────────────────────────

        /// <summary>
        /// PUT /api/Profile
        /// Body: { "email": "...", "phoneNumber": "..." }
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId  = GetCurrentUserId();
                var updated = await _profileRepository.UpdateProfileAsync(userId, dto);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ─── CHANGE PASSWORD ─────────────────────────────────────────────────────

        /// <summary>
        /// POST /api/Profile/change-password
        /// Body: { "currentPassword": "...", "newPassword": "..." }
        /// </summary>
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = GetCurrentUserId();
                await _profileRepository.ChangePasswordAsync(userId, dto);
                return Ok(new { message = "Đổi mật khẩu thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
