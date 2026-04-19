using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    public class Invoice
    {
        [Key]
        public int InvoiceId { get; set; }
        public int RoomUseId { get; set; }
        public string UserId { get; set; }
        public double? SubTotal { get; set; }
        public double? DiscountAmount { get; set; }
        public double? SurchargeAmount { get; set; }
        public double? FinalAmount { get; set; }
        public string PaymentStatus { get; set; }
        public string PaymentMethod { get; set; }
        public DateTime? PaidAt { get; set; }
        public string Note { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public AppUser User { get; set; }

        // Navigation
        public RoomInUse RoomInUse { get; set; }

        // Navigation Collections
        public ICollection<InvoiceDetail> InvoiceDetails { get; set; }
    }
}
