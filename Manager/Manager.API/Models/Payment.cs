namespace Manager.API.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } // Tiền mặt, Thẻ, Chuyển khoản
        public string Status { get; set; } // Chờ xử lý, Hoàn thành, Thất bại, Hoàn tiền
        public DateTime PaymentDate { get; set; } = DateTime.Now;
        public string? TransactionId { get; set; }
        public string? Notes { get; set; }

        // Điều hướng
        public Booking Booking { get; set; }
    }
}
