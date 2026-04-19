using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.RoomRate;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IRoomRateRepository
    {
        Task<PagedResult<RoomRate>> GetAllAsync(int page, int limit);
        Task<RoomRate> GetByIdAsync(int id);
        Task<RoomRate> CreateAsync(int RoomTypeId, RoomRate model);
        Task<RoomRate> UpdateAsync(int id, UpdateRoomRateRequestDto dto);
        Task<RoomRate> DeleteAsync(int id);
    }
}
