namespace Manager.API.Dtos.Messenger
{
    public class CreateMessengerRequestDto
    {
        public int BoxId { get; set; }
        public string FromUserId { get; set; }
        public string Content { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
