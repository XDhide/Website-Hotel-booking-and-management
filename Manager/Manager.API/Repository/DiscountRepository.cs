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
        public async Task<Discount> CreateAsync(Discount Discount)
        {
            await _dBContext.Discounts.AddAsync(Discount);
            await _dBContext.SaveChangesAsync();
            return Discount;
        }

        public async Task<Discount?> DeleteAsync(int id)
        {
            var discount = await _dBContext.Discounts.FirstOrDefaultAsync(s => s.Id == id);
            if (discount == null)
            {
                return null;
            }
            _dBContext.Discounts.Remove(discount);
            await _dBContext.SaveChangesAsync();
            return discount;
        }

        public async Task<PagedResult<Discount>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            var query = _dBContext.Discounts.AsQueryable();

            var totalCount = await query.CountAsync();

            var data = await query
                .OrderByDescending(d => d.Id)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)totalCount / limit);

            return new PagedResult<Discount>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<Discount?> GetByIdAsync(int id)
        {
            var discount = await _dBContext.Discounts.FindAsync(id);
            return discount;
        }

        public async Task<Discount?> UpdateAsync(int id, UpdateDiscountRequetsDto DiscountDto)
        {
            var discount = await _dBContext.Discounts.FirstOrDefaultAsync(s => s.Id == id);
            if (discount == null)
            {
                return null;
            }
            discount.Name = DiscountDto.Name;
            discount.DiscountType = DiscountDto.DiscountType;
            discount.DiscountValue = DiscountDto.DiscountValue;
            discount.FromDate = DiscountDto.FromDate;
            discount.ToDate = DiscountDto.ToDate;
            discount.UpdateAt = DateTime.Now;

            await _dBContext.SaveChangesAsync();
            return discount;
        }
    }
}
