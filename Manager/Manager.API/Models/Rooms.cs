using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    public class Rooms
    {
        [Key]
        public int RoomId { get; set; }
        public string RoomNumber { get; set; }
        public int RoomTypeId { get; set; }
        public string CurrentStatus { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public RoomType RoomType { get; set; }

        // Navigation Collections
        public ICollection<RoomInUse> RoomInUses { get; set; }
        public ICollection<LostItem> LostItems { get; set; }
    }
}
