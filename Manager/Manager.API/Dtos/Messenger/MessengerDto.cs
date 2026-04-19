using System;

namespace Manager.API.Dtos.Messenger
{
    public class MessengerDto
    {
        public int Id { get; set; }
        public int BoxId { get; set; }
        public string FromUserId { get; set; }
        public string Content { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
