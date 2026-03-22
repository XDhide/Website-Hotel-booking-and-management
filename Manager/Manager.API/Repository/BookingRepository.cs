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

        public async Task<List<Booking>> GetAllAsync()
        {
            return await _context.Bookings
                .Include(b => b.Room)
                .Include(b => b.User)
                .Include(b => b.BookingServices)
                .ThenInclude(bs => bs.Service)
                .ToListAsync();
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
            existingBooking.TotalAmount = booking.TotalAmount;
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
