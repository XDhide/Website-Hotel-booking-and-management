using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.RoomType;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class RoomTypeRepository : IRoomTypeRepository
    {
        private readonly ApplicationDBContext _dBContext;

        public RoomTypeRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public async Task<RoomType> CreateAsync(RoomType model)
        {
            var newModel = new RoomType
            {
                Name = model.Name,
                Capacity = model.Capacity,
                Description = model.Description,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
            };
            await _dBContext.RoomTypes.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();
            return newModel;
        }

        public async Task<RoomType> DeleteAsync(int id)
        {
            var model = await _dBContext.RoomTypes.FirstOrDefaultAsync(s => s.Id == id);
            if (model == null)
                return null;
            _dBContext.RoomTypes.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<RoomType>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.RoomTypes
                .Include(rt => rt.Images)
                .Include(rt => rt.Rooms)
                .AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query
                .OrderByDescending(r => r.Id)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<RoomType>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data,
            };
        }

        public async Task<RoomType> GetByIdAsync(int id)
        {
            return await _dBContext.RoomTypes
                .Include(rt => rt.Images)
                .Include(rt => rt.Rooms)
                .FirstOrDefaultAsync(rt => rt.Id == id);
        }

        public async Task<RoomType> UpdateAsync(int id, UpdateRoomTypeRequestDto dto)
        {
            var model = await _dBContext.RoomTypes.FirstOrDefaultAsync(s => s.Id == id);
            if (model == null)
                return null;
            model.Name = dto.Name;
            model.Capacity = dto.Capacity;
            model.Description = dto.Description;
            model.CreatedAt = dto.CreatedAt;
            model.UpdatedAt = DateTime.Now;
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<RoomTypeImage> AddImageAsync(int roomTypeId, RoomTypeImage image)
        {
            var roomType = await _dBContext.RoomTypes.FindAsync(roomTypeId);
            if (roomType == null)
                return null;
            await _dBContext.RoomTypeImages.AddAsync(image);
            await _dBContext.SaveChangesAsync();
            return image;
        }

        public async Task<RoomTypeImage> DeleteImageAsync(int imageId)
        {
            var image = await _dBContext.RoomTypeImages.FindAsync(imageId);
            if (image == null)
                return null;
            _dBContext.RoomTypeImages.Remove(image);
            await _dBContext.SaveChangesAsync();
            return image;
        }

        public async Task<RoomTypeImage> GetImageByIdAsync(int imageId)
        {
            return await _dBContext.RoomTypeImages.FindAsync(imageId);
        }

        public async Task<List<RoomTypeImage>> GetImagesAsync(int roomTypeId)
        {
            return await _dBContext.RoomTypeImages
                .Where(i => i.RoomTypeId == roomTypeId)
                .OrderBy(i => i.DisplayOrder)
                .ToListAsync();
        }
    }
}
