using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    public class RoomType
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Capacity { get; set; }
        public string Description { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        // Navigation Collections
        public ICollection<Rooms> Rooms { get; set; }
        public ICollection<RoomRate> RoomRates { get; set; }
        public ICollection<Booking> Bookings { get; set; }
    }
}
