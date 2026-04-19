using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    public class Discount
    {
        [Key]
        public int DiscountId { get; set; }
        public string Name { get; set; }
        public string DiscountType { get; set; }
        public double? DiscountValue { get; set; }
        public double? MinAmount { get; set; }
        public double? MaxDiscount { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
