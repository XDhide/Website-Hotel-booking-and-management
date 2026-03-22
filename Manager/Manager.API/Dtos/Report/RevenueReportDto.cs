namespace Manager.API.Dtos.Report
{
    public class RevenueReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalBookings { get; set; }
        public int CompletedBookings { get; set; }
        public int CancelledBookings { get; set; }
        public decimal AverageBookingValue { get; set; }
        public List<DailyRevenueDto> DailyRevenues { get; set; }
    }

    public class DailyRevenueDto
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
        public int BookingCount { get; set; }
    }
}
