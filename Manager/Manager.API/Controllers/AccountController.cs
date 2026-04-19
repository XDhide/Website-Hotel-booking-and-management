using Manager.API.Dtos.Account;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Manager.API.Controllers
{
    [Route("api/Account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly SignInManager<AppUser> _signInManager;

        public AccountController(
            UserManager<AppUser> userManager,
            ITokenService tokenService,
            SignInManager<AppUser> signInManager)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _signInManager = signInManager;
        }

        // ================= REGISTER =================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = new AppUser
            {
                UserName = dto.Username,
                Email = dto.Email,
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
                return StatusCode(500, result.Errors);

            await _userManager.AddToRoleAsync(user, "Admin");

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.UserName,
                user.Email,
                Roles = roles,
                Token = await _tokenService.createToken(user) // 🔥 FIX
            });
        }

        // ================= LOGIN =================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByNameAsync(dto.Username);

            if (user == null)
                return Unauthorized("Invalid username or password.");

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);

            if (!result.Succeeded)
                return Unauthorized("Invalid username or password.");

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.UserName,
                user.Email,
                Roles = roles,
                Token = await _tokenService.createToken(user) // 🔥 FIX
            });
        }

        // ================= GET ME =================
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            var user = await _userManager.FindByNameAsync(username);

            if (user == null)
                return NotFound();

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.UserName,
                user.Email,
                Roles = roles
            });
        }

        // ================= USER LIST =================
        [HttpGet("userlist")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UserList(int page = 1, int limit = 10)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            var query = _userManager.Users;

            var totalCount = await query.CountAsync();

            var totalPages = totalCount == 0
                ? 0
                : (int)Math.Ceiling((double)totalCount / limit);

            var users = await query
                .OrderBy(u => u.UserName)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            var tasks = users.Select(async user => new
            {
                Id = user.Id,
                Username = user.UserName,
                Email = user.Email,
                Roles = await _userManager.GetRolesAsync(user)
            });

            var result = await Task.WhenAll(tasks);

            return Ok(new
            {
                page,
                limit,
                totalCount,
                totalPages, // 👈 đây chính là tổng số trang
                data = result
            });
        }
    }
}