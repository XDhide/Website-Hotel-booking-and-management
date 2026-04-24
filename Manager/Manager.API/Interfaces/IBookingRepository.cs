using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.Booking;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IBookingRepository
    {
        Task<PagedResult<Booking>> GetAllAsync(int page, int limit);
        Task<List<Booking>> GetByUserIdAsync(string userId);
        Task<Booking> GetByIdAsync(int id);
        Task<Booking> CreateAsync(string UserId, int RoomTypeId, Booking model);
        Task<Booking> UpdateAsync(int id, UpdateBookingRequestDto dto);
        Task<Booking> DeleteAsync(int id);
    }
}
