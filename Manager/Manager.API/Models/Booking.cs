using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    public class Booking
    {
        [Key]
        public int Id { get; set; }
        public string UserId { get; set; }
        public int RoomTypeId { get; set; }
        public double? Deposit { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedAt { get; set; }

        // Navigation
        public AppUser User { get; set; }

        // Navigation
        public RoomType RoomType { get; set; }

        // Navigation Collections
        public ICollection<RoomInUse> RoomInUses { get; set; }
    }
}
