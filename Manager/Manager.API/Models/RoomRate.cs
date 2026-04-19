using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    public class RoomRate
    {
        [Key]
        public int RoomRateId { get; set; }
        public int RoomTypeId { get; set; }
        public string RentType { get; set; }
        public double? Price { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public RoomType RoomType { get; set; }
    }
}
