using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    public class SupportChat
    {
        [Key]
        public int Id { get; set; }

        public string UserId { get; set; }

        public string Status { get; set; } = "Open"; // Open | Closed

        public DateTime? CreatedAt { get; set; }

        public DateTime? ClosedAt { get; set; }

        // Navigation
        public AppUser User { get; set; }

        public ICollection<SupportMessage> Messages { get; set; }
    }

    public class SupportMessage
    {
        [Key]
        public int Id { get; set; }

        public int SupportChatId { get; set; }

        public string SenderId { get; set; }

        public string Message { get; set; }

        public bool IsStaff { get; set; }

        public DateTime? SentAt { get; set; }

        // Navigation
        public SupportChat SupportChat { get; set; }

        public AppUser Sender { get; set; }
    }
}
