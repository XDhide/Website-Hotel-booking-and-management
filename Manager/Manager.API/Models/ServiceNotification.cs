using System;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    public class ServiceNotification
    {
        [Key]
        public int Id { get; set; }
        public int InvoiceDetailId { get; set; }
        public int InvoiceId { get; set; }
        public int RoomUseId { get; set; }
        public string UserId { get; set; }
        public string RoomNumber { get; set; }
        public string RoomTypeName { get; set; }
        public string ServiceName { get; set; }
        public double Quantity { get; set; }
        public double TotalPrice { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation
        public InvoiceDetail InvoiceDetail { get; set; }
    }
}
