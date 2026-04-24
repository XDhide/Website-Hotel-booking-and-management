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

// ─── DTOs nằm ngay đây cho tiện (hoặc chuyển sang Dtos/Report/) ───────────────

namespace Manager.API.Interfaces
{
    public class RevenueReportDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public double TotalRevenue { get; set; }
        public int TotalBookings { get; set; }
        public List<RevenueByDayDto> ByDay { get; set; }
    }

    public class RevenueByDayDto
    {
        public string Date { get; set; }
        public double Revenue { get; set; }
        public int Bookings { get; set; }
    }

    public class OccupancyReportDto
    {
        public string Date { get; set; }
        public int TotalRooms { get; set; }
        public int OccupiedRooms { get; set; }
        public double OccupancyRate { get; set; }
    }
}
