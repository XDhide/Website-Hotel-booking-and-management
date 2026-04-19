using Manager.API.Data;
using Manager.API.Dtos.LostItem;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class LostItemRepository : ILostItemRepository
    {
        private readonly ApplicationDBContext _context;
        public LostItemRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<LostItem>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            var query = _context.LostItems.AsQueryable();

            var totalCount = await query.CountAsync();

            var data = await query
                .OrderByDescending(l => l.Id)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            var totalPages = totalCount == 0
                ? 0
                : (int)Math.Ceiling((double)totalCount / limit);

            return new PagedResult<LostItem>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<LostItem?> GetByIdAsync(int id)
        {
            return await _context.LostItems.FindAsync(id);
        }

        public async Task<LostItem> CreateAsync(LostItem lostItem)
        {
            lostItem.CreateAt = DateTime.Now;
            lostItem.UpdateAt = DateTime.Now;
            lostItem.Status = "Lost";
            await _context.LostItems.AddAsync(lostItem);
            await _context.SaveChangesAsync();
            return lostItem;
        }

        public async Task<LostItem?> UpdateAsync(int id, UpdateLostItemDto dto)
        {
            var lostItem = await _context.LostItems.FindAsync(id);
            if (lostItem == null) return null;

            lostItem.ItemName = dto.ItemName;
            lostItem.Description = dto.Description;
            lostItem.Status = dto.Status;
            lostItem.FoundDate = dto.FoundDate;
            lostItem.UpdateAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return lostItem;
        }

        public async Task<LostItem?> DeleteAsync(int id)
        {
            var lostItem = await _context.LostItems.FindAsync(id);
            if (lostItem == null) return null;

            _context.LostItems.Remove(lostItem);
            await _context.SaveChangesAsync();
            return lostItem;
        }
    }
}