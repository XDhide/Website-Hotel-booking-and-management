using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.SupportChat;
using Manager.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Controllers
{
    [Route("api/SupportChat")]
    [ApiController]
    [Authorize]
    public class SupportChatController : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public SupportChatController(ApplicationDBContext db)
        {
            _db = db;
        }

        private string GetUserId() =>
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        private bool IsStaff() =>
            User.IsInRole("Admin") || User.IsInRole("Manager");

        [HttpGet("my-chats")]
        public async Task<IActionResult> GetMyChats()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            IQueryable<SupportChat> query;

            if (IsStaff())
            {

                query = _db.SupportChats
                    .OrderByDescending(c => c.CreatedAt);
            }
            else
            {

                query = _db.SupportChats
                    .Where(c => c.UserId == userId)
                    .OrderByDescending(c => c.CreatedAt);
            }

            var chats = await query.ToListAsync();
            var dtos = chats.Select(c => new SupportChatDto
            {
                Id        = c.Id,
                UserId    = c.UserId,
                Status    = c.Status,
                CreatedAt = c.CreatedAt,
                ClosedAt  = c.ClosedAt,
            }).ToList();

            return Ok(dtos);
        }

        [HttpGet("{chatId}/messages")]
        public async Task<IActionResult> GetMessages(int chatId)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var chat = await _db.SupportChats.FindAsync(chatId);
            if (chat == null) return NotFound($"Chat {chatId} không tìm thấy.");

            if (!IsStaff() && chat.UserId != userId)
                return Forbid();

            var messages = await _db.SupportMessages
                .Where(m => m.SupportChatId == chatId)
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            var dtos = messages.Select(m => new SupportMessageDto
            {
                Id            = m.Id,
                SupportChatId = m.SupportChatId,
                SenderId      = m.SenderId,
                Message       = m.Message,
                IsStaff       = m.IsStaff,
                SentAt        = m.SentAt,
            }).ToList();

            return Ok(dtos);
        }

        [HttpPost]
        [HttpPost("open")]
        public async Task<IActionResult> CreateChat()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var existing = await _db.SupportChats
                .FirstOrDefaultAsync(c => c.UserId == userId && c.Status == "Open");

            if (existing != null)
                return Ok(new SupportChatDto
                {
                    Id        = existing.Id,
                    UserId    = existing.UserId,
                    Status    = existing.Status,
                    CreatedAt = existing.CreatedAt,
                    ClosedAt  = existing.ClosedAt,
                });

            var chat = new SupportChat
            {
                UserId    = userId,
                Status    = "Open",
                CreatedAt = DateTime.Now,
            };

            await _db.SupportChats.AddAsync(chat);
            await _db.SaveChangesAsync();

            return Ok(new SupportChatDto
            {
                Id        = chat.Id,
                UserId    = chat.UserId,
                Status    = chat.Status,
                CreatedAt = chat.CreatedAt,
            });
        }

        [HttpPost("send-message")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var chat = await _db.SupportChats.FindAsync(dto.SupportChatId);
            if (chat == null) return NotFound($"Chat {dto.SupportChatId} không tìm thấy.");

            if (chat.Status == "Closed")
                return BadRequest("Chat này đã đóng.");

            if (!IsStaff() && chat.UserId != userId)
                return Forbid();

            var msg = new SupportMessage
            {
                SupportChatId = dto.SupportChatId,
                SenderId      = userId,
                Message       = dto.Message,
                IsStaff       = IsStaff(),
                SentAt        = DateTime.Now,
            };

            await _db.SupportMessages.AddAsync(msg);

            if (IsStaff() && chat.Status == "Open")
                chat.Status = "InProgress";

            await _db.SaveChangesAsync();

            return Ok(new SupportMessageDto
            {
                Id            = msg.Id,
                SupportChatId = msg.SupportChatId,
                SenderId      = msg.SenderId,
                Message       = msg.Message,
                IsStaff       = msg.IsStaff,
                SentAt        = msg.SentAt,
            });
        }

        [HttpPost("{chatId}/close")]
        public async Task<IActionResult> CloseChat(int chatId)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var chat = await _db.SupportChats
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Id == chatId);
            if (chat == null) return NotFound($"Chat {chatId} không tìm thấy.");

            if (!IsStaff() && chat.UserId != userId)
                return Forbid();

            // Xóa toàn bộ messages trước
            if (chat.Messages != null && chat.Messages.Count > 0)
                _db.SupportMessages.RemoveRange(chat.Messages);

            // Xóa chat
            _db.SupportChats.Remove(chat);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Cuộc hội thoại đã được kết thúc và xóa." });
        }

        /// <summary>Kiểm tra trạng thái chat hiện tại của user (để user biết chat bị đóng)</summary>
        [HttpGet("{chatId}/status")]
        public async Task<IActionResult> GetChatStatus(int chatId)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var chat = await _db.SupportChats.FindAsync(chatId);
            if (chat == null)
                return Ok(new { status = "Deleted", message = "Cuộc hội thoại đã kết thúc" });

            if (!IsStaff() && chat.UserId != userId)
                return Forbid();

            return Ok(new { status = chat.Status, chatId = chat.Id });
        }
    }
}
