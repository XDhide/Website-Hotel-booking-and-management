using System.ComponentModel.DataAnnotations;

namespace Manager.API.Dtos.Booking
{
    public class UpdateBookingRequestDto
    {
        public DateTime? CheckInDate { get; set; }
        public DateTime? CheckOutDate { get; set; }
        
        [Range(1, 20)]
        public int? NumberOfGuests { get; set; }
        
        public string? SpecialRequests { get; set; }
    }
}
