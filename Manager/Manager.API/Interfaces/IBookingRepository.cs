using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IBookingRepository
    {
        Task<PagedResult<Booking>> GetAllAsync(int page, int limit);
        Task<Booking?> GetByIdAsync(int id);
        Task<List<Booking>> GetByUserIdAsync(string userId);
        Task<Booking> CreateAsync(Booking booking);
        Task<Booking?> UpdateAsync(int id, Booking booking);
        Task<Booking?> DeleteAsync(int id);
        Task<bool> BookingExistsAsync(int id);
        Task<List<Booking>> GetBookingsByDateRangeAsync(DateTime startDate, DateTime endDate);
    }
}