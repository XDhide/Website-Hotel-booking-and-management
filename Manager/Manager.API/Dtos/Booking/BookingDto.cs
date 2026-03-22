namespace Manager.API.Dtos.Booking
{
    public class BookingDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int RoomId { get; set; }
        public string RoomNumber { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int NumberOfGuests { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public string? SpecialRequests { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
