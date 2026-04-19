using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.Discount;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IDiscountRepository
    {
        Task<PagedResult<Discount>> GetAllAsync(int page, int limit);
        Task<Discount> GetByIdAsync(int id);
        Task<Discount> CreateAsync(Discount model);
        Task<Discount> UpdateAsync(int id, UpdateDiscountRequestDto dto);
        Task<Discount> DeleteAsync(int id);
    }
}
