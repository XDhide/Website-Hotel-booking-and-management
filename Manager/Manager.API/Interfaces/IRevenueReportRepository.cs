using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Manager.API.Interfaces
{
    public interface IRevenueReportRepository
    {
        Task<RevenueReportDto> GetRevenueAsync(DateTime? startDate, DateTime? endDate);
        Task<OccupancyReportDto> GetOccupancyAsync(DateTime? date);
    }
}

namespace Manager.API.Interfaces
{
    public class DailyRevenueDto
    {
        public string Date { get; set; }
        public double Revenue { get; set; }
        public int BookingCount { get; set; }
    }

    public class RevenueReportDto
    {
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public double TotalRevenue { get; set; }
        public int TotalBookings { get; set; }
        public int CompletedBookings { get; set; }
        public int CancelledBookings { get; set; }
        public double AverageBookingValue { get; set; }
        public List<DailyRevenueDto> DailyRevenues { get; set; }
    }

    public class OccupancyReportDto
    {
        public string Date { get; set; }
        public int TotalRooms { get; set; }
        public int OccupiedRooms { get; set; }
        public double OccupancyRate { get; set; }
        public int CheckedInBookings { get; set; }
        public int ConfirmedBookings { get; set; }
        public int PendingBookings { get; set; }
        public int TotalBookings { get; set; }
    }
}
