using System;
using System.Threading.Tasks;
using Manager.API.Dtos.Profile;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.AspNetCore.Identity;

namespace Manager.API.Repository
{
    public class ProfileRepository : IProfileRepository
    {
        private readonly UserManager<AppUser> _userManager;

        public ProfileRepository(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        // ─── GET PROFILE ─────────────────────────────────────────────────────────

        public async Task<ProfileDto> GetProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                throw new Exception("Người dùng không tìm thấy.");

            return new ProfileDto
            {
                UserName    = user.UserName,
                Email       = user.Email,
                PhoneNumber = user.PhoneNumber,
            };
        }

        // ─── UPDATE PROFILE ──────────────────────────────────────────────────────

        public async Task<ProfileDto> UpdateProfileAsync(
            string userId, UpdateProfileRequestDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                throw new Exception("Người dùng không tìm thấy.");

            if (!string.IsNullOrWhiteSpace(dto.Email))
                user.Email = dto.Email;

            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
                user.PhoneNumber = dto.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Cập nhật thất bại: {errors}");
            }

            return new ProfileDto
            {
                UserName    = user.UserName,
                Email       = user.Email,
                PhoneNumber = user.PhoneNumber,
            };
        }

        // ─── CHANGE PASSWORD ─────────────────────────────────────────────────────

        public async Task ChangePasswordAsync(string userId, ChangePasswordRequestDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                throw new Exception("Người dùng không tìm thấy.");

            var result = await _userManager.ChangePasswordAsync(
                user, dto.CurrentPassword, dto.NewPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Đổi mật khẩu thất bại: {errors}");
            }
        }
    }
}
