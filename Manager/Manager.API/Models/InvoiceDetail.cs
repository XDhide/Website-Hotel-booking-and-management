using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    public class InvoiceDetail
    {
        [Key]
        public int InvoiceDetailId { get; set; }
        public int InvoiceId { get; set; }
        public string ItemType { get; set; }
        public string ItemId { get; set; }
        public string ItemName { get; set; }
        public double? UnitPrice { get; set; }
        public double? Quantity { get; set; }
        public double? TotalPrice { get; set; }
        public DateTime? CreatedAt { get; set; }

        // Navigation
        public Invoice Invoice { get; set; }
    }
}
