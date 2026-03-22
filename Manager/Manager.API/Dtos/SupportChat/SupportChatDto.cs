namespace Manager.API.Dtos.SupportChat
{
    public class SupportChatDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public List<ChatMessageDto> Messages { get; set; }
    }
}
