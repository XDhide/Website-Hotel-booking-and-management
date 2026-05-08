using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.Favorite;

namespace Manager.API.Interfaces
{
    public interface IFavoriteRepository
    {
        Task<List<FavoriteDto>> GetFavoritesAsync(string userId);
        Task<FavoriteDto?> AddFavoriteAsync(string userId, int roomTypeId);
        Task<bool> RemoveFavoriteAsync(string userId, int roomTypeId);
        Task<bool> IsFavoriteAsync(string userId, int roomTypeId);
        Task<List<int>> GetFavoriteIdsAsync(string userId);
    }
}
