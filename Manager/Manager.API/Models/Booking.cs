namespace Manager.API.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int RoomId { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int NumberOfGuests { get; set; }
        public string Status { get; set; } // Chờ xác nhận, Đã xác nhận, Đã nhận phòng, Đã trả phòng, Đã hủy
        public decimal TotalAmount { get; set; }
        public string? SpecialRequests { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Điều hướng
        public AppUser User { get; set; }
        public Rooms Room { get; set; }
        public ICollection<BookingService> BookingServices { get; set; }
        public ICollection<Payment> Payments { get; set; }
    }
}
