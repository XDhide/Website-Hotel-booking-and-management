using System.ComponentModel.DataAnnotations;

namespace Manager.API.Dtos.CheckInOut
{
    public class ExtendBookingRequestDto
    {
        [Required]
        public int BookingId { get; set; }
        
        [Required]
        public DateTime NewCheckOutDate { get; set; }
        
        public List<int>? AdditionalServiceIds { get; set; }
    }
}
