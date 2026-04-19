using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.MessengerBox;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class MessengerBoxRepository : IMessengerBoxRepository
    {
        private readonly ApplicationDBContext _dBContext;

        public MessengerBoxRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public async Task<MessengerBox> CreateAsync(string UserId, MessengerBox model)
        {
            var user = await _dBContext.Users.FirstOrDefaultAsync(s => s.Id == UserId);
            if (user == null)
                throw new Exception("User not found");

            var newModel = new MessengerBox
            {
                UserId = model.UserId,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
            };
            await _dBContext.MessengerBox.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();
            return newModel;
        }

        public async Task<MessengerBox> DeleteAsync(int id)
        {
            var model = await _dBContext.MessengerBox.FirstOrDefaultAsync(s => s.Id == id);
            if (model == null)
                return null;
            _dBContext.MessengerBox.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<MessengerBox>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.MessengerBox.AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query.OrderByDescending(r => r.Id).Skip((page - 1) * limit).Take(limit).ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<MessengerBox>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<MessengerBox> GetByIdAsync(int id)
        {
            return await _dBContext.MessengerBox.FindAsync(id);
        }

        public async Task<MessengerBox> UpdateAsync(int id, UpdateMessengerBoxRequestDto dto)
        {
            var model = await _dBContext.MessengerBox.FirstOrDefaultAsync(s => s.Id == id);
            if (model == null)
                return null;
            var user = await _dBContext.Users.FirstOrDefaultAsync(s => s.Id == dto.UserId);
            if (user == null)
                throw new Exception("User not found");
            model.UserId = dto.UserId;
            model.CreatedAt = dto.CreatedAt;
            model.UpdatedAt = DateTime.Now;
            await _dBContext.SaveChangesAsync();
            return model;
        }
    }
}
