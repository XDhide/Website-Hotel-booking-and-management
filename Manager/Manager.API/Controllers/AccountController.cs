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
        private readonly RoleManager<IdentityRole> _roleManager;

        public AccountController(
            UserManager<AppUser> userManager,
            ITokenService tokenService,
            SignInManager<AppUser> signInManager,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _signInManager = signInManager;
            _roleManager = roleManager;
        }

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

            const string defaultRole = "Guest";
            if (!await _roleManager.RoleExistsAsync(defaultRole))
                await _roleManager.CreateAsync(new IdentityRole(defaultRole));

            var roleResult = await _userManager.AddToRoleAsync(user, defaultRole);
            if (!roleResult.Succeeded)
                return StatusCode(500, roleResult.Errors);

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.UserName,
                user.Email,
                Roles = roles,
                Token = await _tokenService.createToken(user)
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByNameAsync(dto.Username);

            if (user == null)
                return Unauthorized("Tên đăng nhập hoặc mật khẩu không đúng.");

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);

            if (!result.Succeeded)
                return Unauthorized("Tên đăng nhập hoặc mật khẩu không đúng.");

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.UserName,
                user.Email,
                Roles = roles,
                Token = await _tokenService.createToken(user)
            });
        }

        [HttpPost("assign-role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignRole([FromBody] AssignRoleDto dto)
        {
            var user = await _userManager.FindByNameAsync(dto.Username);
            if (user == null)
                return NotFound("Không tìm thấy user.");

            if (!await _roleManager.RoleExistsAsync(dto.Role))
                return BadRequest($"Role '{dto.Role}' không tồn tại.");

            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);

            var result = await _userManager.AddToRoleAsync(user, dto.Role);
            if (!result.Succeeded)
                return StatusCode(500, result.Errors);

            return Ok(new { message = $"Đã gán role '{dto.Role}' cho user '{dto.Username}'." });
        }

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

        [HttpGet("userlist")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UserList(
            [FromServices] Data.ApplicationDBContext db,
            int page = 1, int limit = 10)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            var totalCount = await _userManager.Users.CountAsync();

            var totalPages = totalCount == 0
                ? 0
                : (int)Math.Ceiling((double)totalCount / limit);

            var usersWithRoles = await (
                from u in db.Users
                orderby u.UserName
                select new
                {
                    u.Id,
                    u.UserName,
                    u.Email,
                    Roles = (
                        from ur in db.UserRoles
                        join r  in db.Roles on ur.RoleId equals r.Id
                        where ur.UserId == u.Id
                        select r.Name
                    ).ToList()
                }
            )
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

            return Ok(new
            {
                page,
                limit,
                totalCount,
                totalPages,
                data = usersWithRoles.Select(u => new
                {
                    Id       = u.Id,
                    Username = u.UserName,
                    Email    = u.Email,
                    Roles    = u.Roles
                })
            });
        }
    }
}
