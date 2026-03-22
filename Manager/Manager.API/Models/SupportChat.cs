namespace Manager.API.Models
{
    public class SupportChat
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Status { get; set; } // Mở, Đang xử lý, Đã đóng
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? ClosedAt { get; set; }

        // Điều hướng
        public AppUser User { get; set; }
        public ICollection<ChatMessage> Messages { get; set; }
    }
}
