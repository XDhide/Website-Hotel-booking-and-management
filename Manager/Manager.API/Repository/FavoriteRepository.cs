using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.Favorite;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class FavoriteRepository : IFavoriteRepository
    {
        private readonly ApplicationDBContext _context;

        public FavoriteRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<FavoriteDto>> GetFavoritesAsync(string userId)
        {
            return await _context.UserFavorites
                .Where(f => f.UserId == userId)
                .Include(f => f.RoomType)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FavoriteDto
                {
                    FavoriteId   = f.FavoriteId,
                    RoomTypeId   = f.RoomTypeId,
                    RoomTypeName = f.RoomType.Name ?? string.Empty,
                    CreatedAt    = f.CreatedAt,
                })
                .ToListAsync();
        }

        public async Task<FavoriteDto?> AddFavoriteAsync(string userId, int roomTypeId)
        {
            var existing = await _context.UserFavorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.RoomTypeId == roomTypeId);

            if (existing != null)
            {
                var rt0 = await _context.RoomTypes.FindAsync(roomTypeId);
                return new FavoriteDto
                {
                    FavoriteId   = existing.FavoriteId,
                    RoomTypeId   = existing.RoomTypeId,
                    RoomTypeName = rt0?.Name ?? string.Empty,
                    CreatedAt    = existing.CreatedAt,
                };
            }

            var roomType = await _context.RoomTypes.FindAsync(roomTypeId);
            if (roomType == null) return null;

            var favorite = new UserFavorite
            {
                UserId     = userId,
                RoomTypeId = roomTypeId,
                CreatedAt  = DateTime.UtcNow,
            };

            _context.UserFavorites.Add(favorite);
            await _context.SaveChangesAsync();

            return new FavoriteDto
            {
                FavoriteId   = favorite.FavoriteId,
                RoomTypeId   = favorite.RoomTypeId,
                RoomTypeName = roomType.Name ?? string.Empty,
                CreatedAt    = favorite.CreatedAt,
            };
        }

        public async Task<bool> RemoveFavoriteAsync(string userId, int roomTypeId)
        {
            var favorite = await _context.UserFavorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.RoomTypeId == roomTypeId);

            if (favorite == null) return false;

            _context.UserFavorites.Remove(favorite);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsFavoriteAsync(string userId, int roomTypeId)
        {
            return await _context.UserFavorites
                .AnyAsync(f => f.UserId == userId && f.RoomTypeId == roomTypeId);
        }

        public async Task<List<int>> GetFavoriteIdsAsync(string userId)
        {
            return await _context.UserFavorites
                .Where(f => f.UserId == userId)
                .Select(f => f.RoomTypeId)
                .ToListAsync();
        }
    }
}
