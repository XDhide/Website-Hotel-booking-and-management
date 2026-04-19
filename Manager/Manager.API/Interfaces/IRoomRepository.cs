using Manager.API.Dtos.Room;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IRoomRepository
    {
        Task<PagedResult<Rooms>> GetAllAsync(int page, int limit);
        Task<Rooms?> GetByIdAsync(int id);
        Task<Rooms> CreateAsync(int IdRoomType,Rooms Room);
        Task<Rooms?> UpdateAsync(int id, UpdateRoomRequestDto RoomDto);
        Task<Rooms?> DeleteAsync(int id);
    }
}
