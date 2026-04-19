using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    public class RoomInUse
    {
        [Key]
        public int RoomUseId { get; set; }
        public int BookingId { get; set; }
        public int RoomId { get; set; }
        public string RentType { get; set; }
        public DateTime? CheckInActual { get; set; }
        public DateTime? CheckOutActual { get; set; }
        public double? PricePerUnit { get; set; }
        public double? TotalAmount { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public Rooms Rooms { get; set; }

        // Navigation
        public Booking Booking { get; set; }

        // Navigation Collections
        public ICollection<Invoice> Invoices { get; set; }
        public ICollection<Evaluation> Evaluations { get; set; }
        public ICollection<LostItem> LostItems { get; set; }
    }
}
