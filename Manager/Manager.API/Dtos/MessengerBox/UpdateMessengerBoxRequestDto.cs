namespace Manager.API.Dtos.MessengerBox
{
    public class UpdateMessengerBoxRequestDto
    {
        public string UserId { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
