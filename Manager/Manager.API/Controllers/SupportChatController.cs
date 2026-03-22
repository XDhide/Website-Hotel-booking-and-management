using Manager.API.Dtos.SupportChat;
using Manager.API.Interfaces;
using Manager.API.Mappers;
using Manager.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SupportChatController : ControllerBase
    {
        private readonly ISupportChatRepository _chatRepo;
        private readonly UserManager<AppUser> _userManager;

        public SupportChatController(
            ISupportChatRepository chatRepo,
            UserManager<AppUser> userManager)
        {
            _chatRepo = chatRepo;
            _userManager = userManager;
        }

        [HttpGet("my-chats")]
        public async Task<IActionResult> GetMyChats()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var chats = await _chatRepo.GetByUserIdAsync(user.Id);
            var chatDtos = chats.Select(c => c.ToSupportChatDto());
            return Ok(chatDtos);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var chat = await _chatRepo.GetByIdAsync(id);
            if (chat == null)
                return NotFound("Chat not found");

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            // Kiểm tra quyền sở hữu chat hoặc là admin/manager
            if (chat.UserId != user.Id && !User.IsInRole("Admin") && !User.IsInRole("Manager"))
                return Forbid();

            return Ok(chat.ToSupportChatDto());
        }

        [HttpPost("open")]
        public async Task<IActionResult> OpenChat()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var chat = new SupportChat
            {
                UserId = user.Id,
                Status = "Open"
            };

            var createdChat = await _chatRepo.CreateAsync(chat);
            return Ok(new { 
                message = "Support chat opened successfully",
                chatId = createdChat.Id
            });
        }

        [HttpPost("send-message")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var chat = await _chatRepo.GetByIdAsync(dto.SupportChatId);
            if (chat == null)
                return NotFound("Chat not found");

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            // Kiểm tra quyền sở hữu chat hoặc là admin/manager
            if (chat.UserId != user.Id && !User.IsInRole("Admin") && !User.IsInRole("Manager"))
                return Forbid();

            if (chat.Status == "Closed")
                return BadRequest("Cannot send message to closed chat");

            var message = new ChatMessage
            {
                SupportChatId = dto.SupportChatId,
                SenderId = user.Id,
                Message = dto.Message
            };

            var createdMessage = await _chatRepo.AddMessageAsync(message);

            // Cập nhật trạng thái chat sang Đang xử lý nếu đang Mở
            if (chat.Status == "Open")
            {
                chat.Status = "InProgress";
                await _chatRepo.UpdateAsync(dto.SupportChatId, chat);
            }

            return Ok(new
            {
                message = "Message sent successfully",
                messageId = createdMessage.Id,
                sentAt = createdMessage.SentAt
            });
        }

        [HttpPost("{id:int}/close")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> CloseChat([FromRoute] int id)
        {
            var chat = await _chatRepo.GetByIdAsync(id);
            if (chat == null)
                return NotFound("Chat not found");

            if (chat.Status == "Closed")
                return BadRequest("Chat is already closed");

            chat.Status = "Closed";
            chat.ClosedAt = DateTime.Now;
            await _chatRepo.UpdateAsync(id, chat);

            return Ok(new { message = "Chat closed successfully" });
        }

        [HttpGet("{id:int}/messages")]
        public async Task<IActionResult> GetMessages([FromRoute] int id)
        {
            var chat = await _chatRepo.GetByIdAsync(id);
            if (chat == null)
                return NotFound("Chat not found");

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            // Kiểm tra quyền sở hữu chat hoặc là admin/manager
            if (chat.UserId != user.Id && !User.IsInRole("Admin") && !User.IsInRole("Manager"))
                return Forbid();

            var messages = await _chatRepo.GetMessagesAsync(id);
            var messageDtos = messages.Select(m => m.ToChatMessageDto());
            return Ok(messageDtos);
        }
    }
}
