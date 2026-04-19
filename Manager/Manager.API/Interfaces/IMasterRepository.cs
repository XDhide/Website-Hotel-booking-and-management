using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.Master;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IMasterRepository
    {
        Task<PagedResult<Master>> GetAllAsync(int page, int limit);
        Task<Master> GetByIdAsync(int id);
        Task<Master> CreateAsync(Master model);
        Task<Master> UpdateAsync(int id, UpdateMasterRequestDto dto);
        Task<Master> DeleteAsync(int id);
    }
}
