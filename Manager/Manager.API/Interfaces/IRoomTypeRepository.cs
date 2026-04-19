using Manager.API.Dtos.RoomType;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IRoomTypeRepository
    {
        Task<PagedResult<RoomType>> GetAllAsync(int page, int limit);
        Task<RoomType?> GetByIdAsync(int id);
        Task<RoomType> CreateAsync(RoomType RoomType);
        Task<RoomType?> UpdateAsync(int id ,UpdateRoomTypeRequestDto RoomTypeDto);
        Task<RoomType?> DeleteAsync(int id);
    }
}
