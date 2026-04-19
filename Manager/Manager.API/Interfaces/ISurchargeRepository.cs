using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.Surcharge;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface ISurchargeRepository
    {
        Task<PagedResult<Surcharge>> GetAllAsync(int page, int limit);
        Task<Surcharge> GetByIdAsync(int id);
        Task<Surcharge> CreateAsync(Surcharge model);
        Task<Surcharge> UpdateAsync(int id, UpdateSurchargeRequestDto dto);
        Task<Surcharge> DeleteAsync(int id);
    }
}
