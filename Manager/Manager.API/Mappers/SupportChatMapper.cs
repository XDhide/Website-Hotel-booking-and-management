using Manager.API.Dtos.SupportChat;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class SupportChatMapper
    {
        public static SupportChatDto ToSupportChatDto(this SupportChat chat)
        {
            return new SupportChatDto
            {
                Id = chat.Id,
                UserId = chat.UserId,
                Status = chat.Status,
                CreatedAt = chat.CreatedAt,
                ClosedAt = chat.ClosedAt,
                Messages = chat.Messages?.Select(m => m.ToChatMessageDto()).ToList() ?? new List<ChatMessageDto>()
            };
        }

        public static ChatMessageDto ToChatMessageDto(this ChatMessage message)
        {
            return new ChatMessageDto
            {
                Id = message.Id,
                SupportChatId = message.SupportChatId,
                SenderId = message.SenderId,
                SenderName = message.Sender?.UserName ?? "",
                Message = message.Message,
                SentAt = message.SentAt,
                IsRead = message.IsRead
            };
        }
    }
}
