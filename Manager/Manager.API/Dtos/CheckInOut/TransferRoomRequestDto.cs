using System.ComponentModel.DataAnnotations;

namespace Manager.API.Dtos.CheckInOut
{
    public class TransferRoomRequestDto
    {
        [Required]
        public int BookingId { get; set; }
        
        [Required]
        public int NewRoomId { get; set; }
        
        public string? Reason { get; set; }
    }
}
