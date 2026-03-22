using System.ComponentModel.DataAnnotations;

namespace Manager.API.Dtos.CheckInOut
{
    public class CheckInRequestDto
    {
        [Required]
        public int BookingId { get; set; }
        
        public string? Notes { get; set; }
    }
}
