namespace Manager.API.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public int SupportChatId { get; set; }
        public string SenderId { get; set; }
        public string Message { get; set; }
        public DateTime SentAt { get; set; } = DateTime.Now;
        public bool IsRead { get; set; } = false;

        // Điều hướng
        public SupportChat SupportChat { get; set; }
        public AppUser Sender { get; set; }
    }
}
