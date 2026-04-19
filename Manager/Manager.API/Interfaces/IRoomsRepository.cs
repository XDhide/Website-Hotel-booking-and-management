using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.Rooms;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IRoomsRepository
    {
        Task<PagedResult<Rooms>> GetAllAsync(int page, int limit);
        Task<Rooms> GetByIdAsync(int id);
        Task<Rooms> CreateAsync(int RoomTypeId, Rooms model);
        Task<Rooms> UpdateAsync(int id, UpdateRoomsRequestDto dto);
        Task<Rooms> DeleteAsync(int id);
    }
}
