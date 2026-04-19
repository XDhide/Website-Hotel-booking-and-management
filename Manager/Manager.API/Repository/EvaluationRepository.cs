using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.Evaluation;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class EvaluationRepository : IEvaluationRepository
    {
        private readonly ApplicationDBContext _dBContext;

        public EvaluationRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public async Task<Evaluation> CreateAsync(string UserId, int RoomInUseId, Evaluation model)
        {
            var user = await _dBContext.Users.FirstOrDefaultAsync(s => s.Id == UserId);
            if (user == null)
                throw new Exception("User not found");

            var roomInUse = await _dBContext.RoomInUses.FirstOrDefaultAsync(s => s.RoomUseId == RoomInUseId);
            if (roomInUse == null)
                throw new Exception("RoomInUse not found");

            var newModel = new Evaluation
            {
                UserId = model.UserId,
                RoomUseId = model.RoomUseId,
                Rating = model.Rating,
                Comment = model.Comment,
                CreatedAt = DateTime.Now,
            };
            await _dBContext.Evaluations.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();
            return newModel;
        }

        public async Task<Evaluation> DeleteAsync(int id)
        {
            var model = await _dBContext.Evaluations.FirstOrDefaultAsync(s => s.EvaluationId == id);
            if (model == null)
                return null;
            _dBContext.Evaluations.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<Evaluation>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.Evaluations.AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query.OrderByDescending(r => r.EvaluationId).Skip((page - 1) * limit).Take(limit).ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<Evaluation>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<Evaluation> GetByIdAsync(int id)
        {
            return await _dBContext.Evaluations.FindAsync(id);
        }

        public async Task<Evaluation> UpdateAsync(int id, UpdateEvaluationRequestDto dto)
        {
            var model = await _dBContext.Evaluations.FirstOrDefaultAsync(s => s.EvaluationId == id);
            if (model == null)
                return null;
            var user = await _dBContext.Users.FirstOrDefaultAsync(s => s.Id == dto.UserId);
            if (user == null)
                throw new Exception("User not found");
            var roomInUse = await _dBContext.RoomInUses.FirstOrDefaultAsync(s => s.RoomUseId == dto.RoomUseId);
            if (roomInUse == null)
                throw new Exception("RoomInUse not found");
            model.UserId = dto.UserId;
            model.RoomUseId = dto.RoomUseId;
            model.Rating = dto.Rating;
            model.Comment = dto.Comment;
            model.CreatedAt = dto.CreatedAt;
            await _dBContext.SaveChangesAsync();
            return model;
        }
    }
}
