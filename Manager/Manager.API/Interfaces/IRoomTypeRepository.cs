using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.RoomType;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IRoomTypeRepository
    {
        Task<PagedResult<RoomType>> GetAllAsync(int page, int limit);
        Task<RoomType> GetByIdAsync(int id);
        Task<RoomType> CreateAsync(RoomType model);
        Task<RoomType> UpdateAsync(int id, UpdateRoomTypeRequestDto dto);
        Task<RoomType> DeleteAsync(int id);
    }
}
