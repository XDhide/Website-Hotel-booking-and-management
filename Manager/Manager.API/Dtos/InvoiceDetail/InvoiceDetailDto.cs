using System;

namespace Manager.API.Dtos.InvoiceDetail
{
    public class InvoiceDetailDto
    {
        public int InvoiceDetailId { get; set; }
        public int InvoiceId { get; set; }
        public string ItemType { get; set; }
        public string ItemId { get; set; }
        public string ItemName { get; set; }
        public double? UnitPrice { get; set; }
        public double? Quantity { get; set; }
        public double? TotalPrice { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
