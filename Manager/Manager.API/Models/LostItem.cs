using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    public class LostItem
    {
        [Key]
        public int LostItemId { get; set; }
        public int? RoomId { get; set; }
        public int? RoomUseId { get; set; }
        public string ItemName { get; set; }
        public string Description { get; set; }
        public DateTime? FoundAt { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedAt { get; set; }

        // Navigation
        public Rooms Rooms { get; set; }

        // Navigation
        public RoomInUse RoomInUse { get; set; }
    }
}
