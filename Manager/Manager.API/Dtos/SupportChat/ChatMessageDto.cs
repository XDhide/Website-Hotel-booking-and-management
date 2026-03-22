namespace Manager.API.Dtos.SupportChat
{
    public class ChatMessageDto
    {
        public int Id { get; set; }
        public int SupportChatId { get; set; }
        public string SenderId { get; set; }
        public string SenderName { get; set; }
        public string Message { get; set; }
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }
    }
}
