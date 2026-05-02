using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class RevenueReportRepository : IRevenueReportRepository
    {
        private readonly ApplicationDBContext _db;

        public RevenueReportRepository(ApplicationDBContext db)
        {
            _db = db;
        }

        public async Task<RevenueReportDto> GetRevenueAsync(
            DateTime? startDate, DateTime? endDate)
        {
            var start = startDate ?? DateTime.Today.AddDays(-30);
            var end = endDate ?? DateTime.Today;

            var invoices = await _db.Invoices
                .Where(i =>
                    i.PaymentStatus == "Paid" &&
                    i.PaidAt.HasValue &&
                    i.PaidAt.Value >= start &&
                    i.PaidAt.Value <= end.AddDays(1))
                .ToListAsync();

            var totalRevenue = invoices.Sum(i => i.FinalAmount ?? 0);
            var totalBookings = invoices.Select(i => i.RoomUseId).Distinct().Count();

            var byDay = invoices
                .GroupBy(i => i.PaidAt!.Value.Date)
                .OrderBy(g => g.Key)
                .Select(g => new DailyRevenueDto
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Revenue = g.Sum(i => i.FinalAmount ?? 0),
                    BookingCount = g.Count(),
                })
                .ToList();

            return new RevenueReportDto
            {
                StartDate = start.ToString("yyyy-MM-dd"),
                EndDate = end.ToString("yyyy-MM-dd"),
                TotalRevenue = totalRevenue,
                TotalBookings = totalBookings,
                CompletedBookings = byDay.Sum(d => d.BookingCount),
                CancelledBookings = 0,
                AverageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0,
                DailyRevenues = byDay,
            };
        }

        public async Task<OccupancyReportDto> GetOccupancyAsync(DateTime? date)
        {
            var targetDate = date ?? DateTime.Today;

            var totalRooms = await _db.Rooms.CountAsync();

            var occupiedRooms = await _db.RoomInUses
                .Where(r =>
                    r.Status == "Active" &&
                    r.CheckInActual.HasValue &&
                    r.CheckInActual.Value.Date <= targetDate.Date &&
                    (r.CheckOutActual == null || r.CheckOutActual.Value.Date >= targetDate.Date))
                .Select(r => r.RoomId)
                .Distinct()
                .CountAsync();

            // Count bookings by status for occupancy report
            var bookings = await _db.Bookings
                .Where(b => b.FromDate.HasValue && b.FromDate.Value.Date == targetDate.Date ||
                            b.ToDate.HasValue && b.ToDate.Value.Date == targetDate.Date ||
                            (b.FromDate.HasValue && b.ToDate.HasValue &&
                             b.FromDate.Value.Date <= targetDate.Date &&
                             b.ToDate.Value.Date >= targetDate.Date))
                .ToListAsync();

            var checkedIn    = await _db.RoomInUses.CountAsync(r => r.Status == "Active");
            var confirmed    = bookings.Count(b => b.Status == "Confirmed");
            var pending      = bookings.Count(b => b.Status == "Pending");

            return new OccupancyReportDto
            {
                Date = targetDate.ToString("yyyy-MM-dd"),
                TotalRooms = totalRooms,
                OccupiedRooms = occupiedRooms,
                OccupancyRate = totalRooms == 0 ? 0 : Math.Round((double)occupiedRooms / totalRooms * 100, 2),
                CheckedInBookings = checkedIn,
                ConfirmedBookings = confirmed,
                PendingBookings = pending,
                TotalBookings = bookings.Count,
            };
        }
    }
}
