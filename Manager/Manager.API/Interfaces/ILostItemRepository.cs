using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.LostItem;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface ILostItemRepository
    {
        Task<PagedResult<LostItem>> GetAllAsync(int page, int limit);
        Task<LostItem> GetByIdAsync(int id);
        Task<LostItem> CreateAsync(int RoomsId, int RoomInUseId, LostItem model);
        Task<LostItem> UpdateAsync(int id, UpdateLostItemRequestDto dto);
        Task<LostItem> DeleteAsync(int id);
    }
}
