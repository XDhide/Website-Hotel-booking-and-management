using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.Discount;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class DiscountRepository : IDiscountRepository
    {
        private readonly ApplicationDBContext _dBContext;

        public DiscountRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public async Task<Discount> CreateAsync(Discount model)
        {
            var newModel = new Discount
            {
                Name = model.Name,
                DiscountType = model.DiscountType,
                DiscountValue = model.DiscountValue,
                MinAmount = model.MinAmount,
                MaxDiscount = model.MaxDiscount,
                FromDate = model.FromDate,
                ToDate = model.ToDate,
                IsActive = model.IsActive,
                CreatedAt = DateTime.Now,
                UpdatedAt = model.UpdatedAt,
            };
            await _dBContext.Discounts.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();
            return newModel;
        }

        public async Task<Discount> DeleteAsync(int id)
        {
            var model = await _dBContext.Discounts.FirstOrDefaultAsync(s => s.DiscountId == id);
            if (model == null)
                return null;
            _dBContext.Discounts.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<Discount>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.Discounts.AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query.OrderByDescending(r => r.DiscountId).Skip((page - 1) * limit).Take(limit).ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<Discount>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<Discount> GetByIdAsync(int id)
        {
            return await _dBContext.Discounts.FindAsync(id);
        }

        public async Task<Discount> UpdateAsync(int id, UpdateDiscountRequestDto dto)
        {
            var model = await _dBContext.Discounts.FirstOrDefaultAsync(s => s.DiscountId == id);
            if (model == null)
                return null;
            model.Name = dto.Name;
            model.DiscountType = dto.DiscountType;
            model.DiscountValue = dto.DiscountValue;
            model.MinAmount = dto.MinAmount;
            model.MaxDiscount = dto.MaxDiscount;
            model.FromDate = dto.FromDate;
            model.ToDate = dto.ToDate;
            model.IsActive = dto.IsActive;
            model.CreatedAt = dto.CreatedAt;
            model.UpdatedAt = DateTime.Now;
            await _dBContext.SaveChangesAsync();
            return model;
        }
    }
}
