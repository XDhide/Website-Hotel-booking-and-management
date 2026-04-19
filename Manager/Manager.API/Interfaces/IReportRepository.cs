using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.Report;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IReportRepository
    {
        Task<PagedResult<Report>> GetAllAsync(int page, int limit);
        Task<Report> GetByIdAsync(int id);
        Task<Report> CreateAsync(string UserId, Report model);
        Task<Report> UpdateAsync(int id, UpdateReportRequestDto dto);
        Task<Report> DeleteAsync(int id);
    }
}
