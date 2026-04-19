using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.Messenger;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class MessengerRepository : IMessengerRepository
    {
        private readonly ApplicationDBContext _dBContext;

        public MessengerRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public async Task<Messenger> CreateAsync(string UserId, int MessengerBoxId, Messenger model)
        {
            var user = await _dBContext.Users.FirstOrDefaultAsync(s => s.Id == UserId);
            if (user == null)
                throw new Exception("User not found");

            var messengerBox = await _dBContext.MessengerBox.FirstOrDefaultAsync(s => s.Id == MessengerBoxId);
            if (messengerBox == null)
                throw new Exception("MessengerBox not found");

            var newModel = new Messenger
            {
                BoxId = model.BoxId,
                FromUserId = model.FromUserId,
                Content = model.Content,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
            };
            await _dBContext.Messengers.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();
            return newModel;
        }

        public async Task<Messenger> DeleteAsync(int id)
        {
            var model = await _dBContext.Messengers.FirstOrDefaultAsync(s => s.Id == id);
            if (model == null)
                return null;
            _dBContext.Messengers.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<Messenger>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.Messengers.AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query.OrderByDescending(r => r.Id).Skip((page - 1) * limit).Take(limit).ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<Messenger>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<Messenger> GetByIdAsync(int id)
        {
            return await _dBContext.Messengers.FindAsync(id);
        }

        public async Task<Messenger> UpdateAsync(int id, UpdateMessengerRequestDto dto)
        {
            var model = await _dBContext.Messengers.FirstOrDefaultAsync(s => s.Id == id);
            if (model == null)
                return null;
            var user = await _dBContext.Users.FirstOrDefaultAsync(s => s.Id == dto.FromUserId);
            if (user == null)
                throw new Exception("User not found");
            var messengerBox = await _dBContext.MessengerBox.FirstOrDefaultAsync(s => s.Id == dto.BoxId);
            if (messengerBox == null)
                throw new Exception("MessengerBox not found");
            model.BoxId = dto.BoxId;
            model.FromUserId = dto.FromUserId;
            model.Content = dto.Content;
            model.CreatedAt = dto.CreatedAt;
            model.UpdatedAt = DateTime.Now;
            await _dBContext.SaveChangesAsync();
            return model;
        }
    }
}
