using System;

namespace Manager.API.Dtos.Booking
{
    public class BookingDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int RoomTypeId { get; set; }
        public double? Deposit { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
