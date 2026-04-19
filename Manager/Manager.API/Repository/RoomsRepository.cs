using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.Rooms;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class RoomsRepository : IRoomsRepository
    {
        private readonly ApplicationDBContext _dBContext;

        public RoomsRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public async Task<Rooms> CreateAsync(int RoomTypeId, Rooms model)
        {
            var roomType = await _dBContext.RoomTypes.FirstOrDefaultAsync(s => s.Id == RoomTypeId);
            if (roomType == null)
                throw new Exception("RoomType not found");

            var newModel = new Rooms
            {
                RoomNumber = model.RoomNumber,
                RoomTypeId = model.RoomTypeId,
                CurrentStatus = model.CurrentStatus,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
            };
            await _dBContext.Rooms.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();
            return newModel;
        }

        public async Task<Rooms> DeleteAsync(int id)
        {
            var model = await _dBContext.Rooms.FirstOrDefaultAsync(s => s.RoomId == id);
            if (model == null)
                return null;
            _dBContext.Rooms.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<Rooms>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.Rooms.AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query.OrderByDescending(r => r.RoomId).Skip((page - 1) * limit).Take(limit).ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<Rooms>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<Rooms> GetByIdAsync(int id)
        {
            return await _dBContext.Rooms.FindAsync(id);
        }

        public async Task<Rooms> UpdateAsync(int id, UpdateRoomsRequestDto dto)
        {
            var model = await _dBContext.Rooms.FirstOrDefaultAsync(s => s.RoomId == id);
            if (model == null)
                return null;
            var roomType = await _dBContext.RoomTypes.FirstOrDefaultAsync(s => s.Id == dto.RoomTypeId);
            if (roomType == null)
                throw new Exception("RoomType not found");
            model.RoomNumber = dto.RoomNumber;
            model.RoomTypeId = dto.RoomTypeId;
            model.CurrentStatus = dto.CurrentStatus;
            model.CreatedAt = dto.CreatedAt;
            model.UpdatedAt = DateTime.Now;
            await _dBContext.SaveChangesAsync();
            return model;
        }
    }
}
