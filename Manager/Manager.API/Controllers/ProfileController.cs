using Manager.API.Dtos.Profile;
using Manager.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;

        public ProfileController(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            return Ok(new
            {
                id = user.Id,
                userName = user.UserName,
                email = user.Email,
                phoneNumber = user.PhoneNumber,
                emailConfirmed = user.EmailConfirmed
            });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var updateRequired = false;

            // Cập nhật email nếu có thay đổi
            if (!string.IsNullOrEmpty(dto.Email) && dto.Email != user.Email)
            {
                var emailExists = await _userManager.FindByEmailAsync(dto.Email);
                if (emailExists != null && emailExists.Id != user.Id)
                    return BadRequest("Email is already in use");

                user.Email = dto.Email;
                user.EmailConfirmed = false;
                updateRequired = true;
            }

            // Cập nhật số điện thoại nếu có thay đổi
            if (!string.IsNullOrEmpty(dto.PhoneNumber) && dto.PhoneNumber != user.PhoneNumber)
            {
                user.PhoneNumber = dto.PhoneNumber;
                updateRequired = true;
            }

            // Cập nhật tên người dùng nếu có thay đổi
            if (!string.IsNullOrEmpty(dto.UserName) && dto.UserName != user.UserName)
            {
                var userNameExists = await _userManager.FindByNameAsync(dto.UserName);
                if (userNameExists != null && userNameExists.Id != user.Id)
                    return BadRequest("Username is already in use");

                user.UserName = dto.UserName;
                updateRequired = true;
            }

            if (updateRequired)
            {
                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    return BadRequest(result.Errors);
            }

            return Ok(new
            {
                message = "Profile updated successfully",
                user = new
                {
                    id = user.Id,
                    userName = user.UserName,
                    email = user.Email,
                    phoneNumber = user.PhoneNumber
                }
            });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Password changed successfully" });
        }
    }
}
