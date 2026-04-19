using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.RoomInUse;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IRoomInUseRepository
    {
        Task<PagedResult<RoomInUse>> GetAllAsync(int page, int limit);
        Task<RoomInUse> GetByIdAsync(int id);
        Task<RoomInUse> CreateAsync(int RoomsId, int BookingId, RoomInUse model);
        Task<RoomInUse> UpdateAsync(int id, UpdateRoomInUseRequestDto dto);
        Task<RoomInUse> DeleteAsync(int id);
    }
}
