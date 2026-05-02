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
        Task<RoomTypeImage> AddImageAsync(int roomTypeId, RoomTypeImage image);
        Task<RoomTypeImage> DeleteImageAsync(int imageId);
        Task<RoomTypeImage> GetImageByIdAsync(int imageId);
        Task<List<RoomTypeImage>> GetImagesAsync(int roomTypeId);
    }
}
