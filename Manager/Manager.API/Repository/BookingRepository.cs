using Manager.API.Data;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class BookingRepository : IBookingRepository
    {
        private readonly ApplicationDBContext _context;

        public BookingRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<Booking>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            var query = _context.Bookings
                .Include(b => b.Room)
                .Include(b => b.User)
                .Include(b => b.BookingServices)
                    .ThenInclude(bs => bs.Service);

            var totalCount = await query.CountAsync();

            var data = await query
                .OrderByDescending(b => b.Id)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)totalCount / limit);

            return new PagedResult<Booking>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<Booking?> GetByIdAsync(int id)
        {
            return await _context.Bookings
                .Include(b => b.Room)
                .Include(b => b.User)
                .Include(b => b.BookingServices)
                    .ThenInclude(bs => bs.Service)
                .Include(b => b.Payments)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<List<Booking>> GetByUserIdAsync(string userId)
        {
            return await _context.Bookings
                .Include(b => b.Room)
                .Include(b => b.BookingServices)
                    .ThenInclude(bs => bs.Service)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<Booking> CreateAsync(Booking booking)
        {
            booking.CreatedAt = DateTime.Now;
            booking.UpdatedAt = DateTime.Now;
            if (string.IsNullOrEmpty(booking.Status))
                booking.Status = "Pending";

            await _context.Bookings.AddAsync(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task<Booking?> UpdateAsync(int id, Booking booking)
        {
            var existingBooking = await _context.Bookings.FindAsync(id);
            if (existingBooking == null) return null;

            existingBooking.CheckInDate = booking.CheckInDate;
            existingBooking.CheckOutDate = booking.CheckOutDate;
            existingBooking.NumberOfGuests = booking.NumberOfGuests;
            existingBooking.Status = booking.Status;
            existingBooking.RentType = booking.RentType;
            existingBooking.TotalPrice = booking.TotalPrice;
            existingBooking.SpecialRequests = booking.SpecialRequests;
            existingBooking.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return existingBooking;
        }

        public async Task<Booking?> DeleteAsync(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return null;

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task<bool> BookingExistsAsync(int id)
        {
            return await _context.Bookings.AnyAsync(b => b.Id == id);
        }

        public async Task<List<Booking>> GetBookingsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Bookings
                .Include(b => b.Room)
                .Include(b => b.Payments)
                .Where(b => b.CheckInDate >= startDate && b.CheckInDate <= endDate)
                .ToListAsync();
        }
    }
}