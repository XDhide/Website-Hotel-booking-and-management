using System.ComponentModel.DataAnnotations;

namespace Manager.API.Dtos.Booking
{
    public class CreateBookingRequestDto
    {
        [Required]
        public int RoomId { get; set; }
        
        [Required]
        public DateTime CheckInDate { get; set; }
        
        [Required]
        public DateTime CheckOutDate { get; set; }
        
        [Required]
        [Range(1, 20)]
        public int NumberOfGuests { get; set; }
        
        public string? SpecialRequests { get; set; }
        
        public List<int>? ServiceIds { get; set; }
    }
}
