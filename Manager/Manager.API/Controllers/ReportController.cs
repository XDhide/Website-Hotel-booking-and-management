using Manager.API.Dtos.Report;
using Manager.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Manager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Manager")]
    public class ReportController : ControllerBase
    {
        private readonly IBookingRepository _bookingRepo;
        private readonly IPaymentRepository _paymentRepo;

        public ReportController(
            IBookingRepository bookingRepo,
            IPaymentRepository paymentRepo)
        {
            _bookingRepo = bookingRepo;
            _paymentRepo = paymentRepo;
        }

        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.Now.AddMonths(-1);
            var end = endDate ?? DateTime.Now;

            if (start > end)
                return BadRequest("Start date must be before end date");

            var bookings = await _bookingRepo.GetBookingsByDateRangeAsync(start, end);

            var totalRevenue = 0m;
            var completedBookings = 0;
            var cancelledBookings = 0;

            foreach (var booking in bookings)
            {
                if (booking.Status == "CheckedOut")
                {
                    var paidAmount = await _paymentRepo.GetTotalPaidAmountAsync(booking.Id);
                    totalRevenue += paidAmount;
                    completedBookings++;
                }
                else if (booking.Status == "Cancelled")
                {
                    cancelledBookings++;
                }
            }

            var dailyRevenues = bookings
                .Where(b => b.Status == "CheckedOut")
                .GroupBy(b => b.CheckInDate.Date)
                .Select(g => new DailyRevenueDto
                {
                    Date = g.Key,
                    Revenue = g.Sum(b => b.TotalAmount),
                    BookingCount = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToList();

            var report = new RevenueReportDto
            {
                StartDate = start,
                EndDate = end,
                TotalRevenue = totalRevenue,
                TotalBookings = bookings.Count,
                CompletedBookings = completedBookings,
                CancelledBookings = cancelledBookings,
                AverageBookingValue = completedBookings > 0 ? totalRevenue / completedBookings : 0,
                DailyRevenues = dailyRevenues
            };

            return Ok(report);
        }

        [HttpGet("occupancy")]
        public async Task<IActionResult> GetOccupancyReport([FromQuery] DateTime? date)
        {
            var targetDate = date ?? DateTime.Now;
            var startOfDay = targetDate.Date;
            var endOfDay = startOfDay.AddDays(1);

            var bookings = await _bookingRepo.GetBookingsByDateRangeAsync(startOfDay, endOfDay);
            var occupiedRooms = bookings.Count(b => b.Status == "CheckedIn");

            return Ok(new
            {
                date = targetDate.Date,
                occupiedRooms = occupiedRooms,
                totalBookings = bookings.Count,
                checkedInBookings = bookings.Count(b => b.Status == "CheckedIn"),
                confirmedBookings = bookings.Count(b => b.Status == "Confirmed"),
                pendingBookings = bookings.Count(b => b.Status == "Pending")
            });
        }
    }
}
