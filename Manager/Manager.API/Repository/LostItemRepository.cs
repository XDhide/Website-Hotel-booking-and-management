using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.LostItem;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class LostItemRepository : ILostItemRepository
    {
        private readonly ApplicationDBContext _dBContext;

        public LostItemRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public async Task<LostItem> CreateAsync(int RoomsId, int RoomInUseId, LostItem model)
        {
            var rooms = await _dBContext.Rooms.FirstOrDefaultAsync(s => s.RoomId == RoomsId);
            if (rooms == null)
                throw new Exception("Rooms not found");

            var roomInUse = await _dBContext.RoomInUses.FirstOrDefaultAsync(s => s.RoomUseId == RoomInUseId);
            if (roomInUse == null)
                throw new Exception("RoomInUse not found");

            var newModel = new LostItem
            {
                RoomId = model.RoomId,
                RoomUseId = model.RoomUseId,
                ItemName = model.ItemName,
                Description = model.Description,
                FoundAt = model.FoundAt,
                Status = model.Status,
                CreatedAt = DateTime.Now,
            };
            await _dBContext.LostItems.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();
            return newModel;
        }

        public async Task<LostItem> DeleteAsync(int id)
        {
            var model = await _dBContext.LostItems.FirstOrDefaultAsync(s => s.LostItemId == id);
            if (model == null)
                return null;
            _dBContext.LostItems.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<LostItem>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.LostItems.AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query.OrderByDescending(r => r.LostItemId).Skip((page - 1) * limit).Take(limit).ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<LostItem>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<LostItem> GetByIdAsync(int id)
        {
            return await _dBContext.LostItems.FindAsync(id);
        }

        public async Task<LostItem> UpdateAsync(int id, UpdateLostItemRequestDto dto)
        {
            var model = await _dBContext.LostItems.FirstOrDefaultAsync(s => s.LostItemId == id);
            if (model == null)
                return null;
            var rooms = await _dBContext.Rooms.FirstOrDefaultAsync(s => s.RoomId == dto.RoomId);
            if (rooms == null)
                throw new Exception("Rooms not found");
            var roomInUse = await _dBContext.RoomInUses.FirstOrDefaultAsync(s => s.RoomUseId == dto.RoomUseId);
            if (roomInUse == null)
                throw new Exception("RoomInUse not found");
            model.RoomId = dto.RoomId;
            model.RoomUseId = dto.RoomUseId;
            model.ItemName = dto.ItemName;
            model.Description = dto.Description;
            model.FoundAt = dto.FoundAt;
            model.Status = dto.Status;
            model.CreatedAt = DateTime.Now;
            await _dBContext.SaveChangesAsync();
            return model;
        }
    }
}
