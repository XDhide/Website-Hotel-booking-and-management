using System.ComponentModel.DataAnnotations;

namespace Manager.API.Dtos.Payment
{
    public class SplitInvoiceRequestDto
    {
        [Required]
        public int BookingId { get; set; }
        
        [Required]
        [MinLength(2)]
        public List<decimal> Amounts { get; set; }
    }
}
