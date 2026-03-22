using System.ComponentModel.DataAnnotations;

namespace Manager.API.Dtos.CheckInOut
{
    public class CheckOutRequestDto
    {
        [Required]
        public int BookingId { get; set; }
        
        public List<int>? AdditionalServiceIds { get; set; }
    }
}
