using System.ComponentModel.DataAnnotations;

namespace Manager.API.Dtos.Payment
{
    public class CreatePaymentRequestDto
    {
        [Required]
        public int BookingId { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }
        
        [Required]
        public string PaymentMethod { get; set; } // Tiền mặt, Thẻ, Chuyển khoản
        
        public string? Notes { get; set; }
    }
}
