using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.Services;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IServicesRepository
    {
        Task<PagedResult<Services>> GetAllAsync(int page, int limit);
        Task<Services> GetByIdAsync(int id);
        Task<Services> CreateAsync(Services model);
        Task<Services> UpdateAsync(int id, UpdateServicesRequestDto dto);
        Task<Services> DeleteAsync(int id);
    }
}
