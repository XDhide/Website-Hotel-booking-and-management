namespace Manager.API.Models
{
    public class BookingService
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public int ServiceId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Điều hướng
        public Booking Booking { get; set; }
        public Services Service { get; set; }
    }
}
