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

        // ─── REVENUE REPORT ──────────────────────────────────────────────────────

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
            var totalBookings = invoices.Select(i => i.RoomUseId).Distinct().Count(); // FIX: RoomInUseId → RoomUseId

            var byDay = invoices
                .GroupBy(i => i.PaidAt!.Value.Date)
                .OrderBy(g => g.Key)
                .Select(g => new RevenueByDayDto
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Revenue = g.Sum(i => i.FinalAmount ?? 0),
                    Bookings = g.Count(),
                })
                .ToList();

            return new RevenueReportDto
            {
                StartDate = start,
                EndDate = end,
                TotalRevenue = totalRevenue,
                TotalBookings = totalBookings,
                ByDay = byDay,
            };
        }

        // ─── OCCUPANCY REPORT ────────────────────────────────────────────────────

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

            var rate = totalRooms == 0
                ? 0
                : Math.Round((double)occupiedRooms / totalRooms * 100, 2);

            return new OccupancyReportDto
            {
                Date = targetDate.ToString("yyyy-MM-dd"),
                TotalRooms = totalRooms,
                OccupiedRooms = occupiedRooms,
                OccupancyRate = rate,
            };
        }
    }
}