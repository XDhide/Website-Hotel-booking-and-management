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
            var model = await _dBContext.RoomTypes
                .Include(rt => rt.Rooms)
                    .ThenInclude(r => r.RoomInUses)
                        .ThenInclude(riu => riu.Invoices)
                            .ThenInclude(inv => inv.InvoiceDetails)
                .Include(rt => rt.Rooms)
                    .ThenInclude(r => r.RoomInUses)
                        .ThenInclude(riu => riu.Invoices)
                .Include(rt => rt.Rooms)
                    .ThenInclude(r => r.RoomInUses)
                        .ThenInclude(riu => riu.Evaluations)
                .Include(rt => rt.Rooms)
                    .ThenInclude(r => r.RoomInUses)
                        .ThenInclude(riu => riu.LostItems)
                .Include(rt => rt.Rooms)
                    .ThenInclude(r => r.RoomInUses)
                .Include(rt => rt.Images)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (model == null)
                return null;

            // Cascade delete in correct order to avoid FK constraint violations
            foreach (var room in model.Rooms ?? new List<Rooms>())
            {
                foreach (var riu in room.RoomInUses ?? new List<RoomInUse>())
                {
                    // Delete invoice details
                    foreach (var inv in riu.Invoices ?? new List<Invoice>())
                    {
                        if (inv.InvoiceDetails != null)
                            _dBContext.InvoiceDetails.RemoveRange(inv.InvoiceDetails);
                    }
                    _dBContext.Invoices.RemoveRange(riu.Invoices ?? new List<Invoice>());
                    _dBContext.Evaluations.RemoveRange(riu.Evaluations ?? new List<Evaluation>());
                    _dBContext.LostItems.RemoveRange(riu.LostItems ?? new List<LostItem>());
                }
                _dBContext.RoomInUses.RemoveRange(room.RoomInUses ?? new List<RoomInUse>());
            }

            // Delete associated bookings (RoomInUses deleted above, so FK is clear)
            var roomIds = model.Rooms?.Select(r => r.RoomId).ToList() ?? new List<int>();
            var relatedRoomTypeId = model.Id;
            var bookings = await _dBContext.Bookings
                .Where(b => b.RoomTypeId == relatedRoomTypeId)
                .ToListAsync();
            _dBContext.Bookings.RemoveRange(bookings);

            // Delete room rate entries
            var roomRates = await _dBContext.RoomRates
                .Where(rr => rr.RoomTypeId == relatedRoomTypeId)
                .ToListAsync();
            _dBContext.RoomRates.RemoveRange(roomRates);

            _dBContext.RoomTypeImages.RemoveRange(model.Images ?? new List<RoomTypeImage>());
            _dBContext.Rooms.RemoveRange(model.Rooms ?? new List<Rooms>());
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
