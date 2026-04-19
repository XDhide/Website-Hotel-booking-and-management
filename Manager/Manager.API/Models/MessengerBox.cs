using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    public class MessengerBox
    {
        [Key]
        public int Id { get; set; }
        public string UserId { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public AppUser User { get; set; }

        // Navigation Collections
        public ICollection<Messenger> Messengers { get; set; }
    }
}
