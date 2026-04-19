using Manager.API.Dtos.RoomRate;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IRoomRateRepository
    {
        Task<PagedResult<RoomRate>> GetAllAsync(int page, int limit);
        Task<RoomRate?> GetByIdAsync(int id);
        Task<RoomRate?> GetByRoomTypeIdAsync(int roomTypeId);
        Task<RoomRate> CreateAsync(int RoomTypeId, RoomRate RoomRate);
        Task<RoomRate?> UpdateAsync(int id, UpdateRoomRateRequestDto RoomRateDto);
        Task<RoomRate?> DeleteAsync(int id);
    }
}
