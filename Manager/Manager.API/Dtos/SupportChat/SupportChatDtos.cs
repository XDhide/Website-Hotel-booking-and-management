using System;
using System.Collections.Generic;

namespace Manager.API.Dtos.SupportChat
{
    public class SupportChatDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
    }

    public class SupportMessageDto
    {
        public int Id { get; set; }
        public int SupportChatId { get; set; }
        public string SenderId { get; set; }
        public string Message { get; set; }
        public bool IsStaff { get; set; }
        public DateTime? SentAt { get; set; }
    }

    public class SupportChatWithMessagesDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public List<SupportMessageDto> Messages { get; set; }
    }

    public class SendMessageRequestDto
    {
        public int SupportChatId { get; set; }
        public string Message { get; set; }
    }
}
