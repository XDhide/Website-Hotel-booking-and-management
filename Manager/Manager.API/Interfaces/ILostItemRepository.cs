using Manager.API.Dtos.LostItem;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface ILostItemRepository
    {
        Task<PagedResult<LostItem>> GetAllAsync(int page, int limit);
        Task<LostItem?> GetByIdAsync(int id);
        Task<LostItem> CreateAsync(LostItem lostItem);
        Task<LostItem?> UpdateAsync(int id, UpdateLostItemDto dto);
        Task<LostItem?> DeleteAsync(int id);
    }
}