using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.Evaluation;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IEvaluationRepository
    {
        Task<PagedResult<Evaluation>> GetAllAsync(int page, int limit);
        Task<Evaluation> GetByIdAsync(int id);
        Task<Evaluation> CreateAsync(string UserId, int RoomInUseId, Evaluation model);
        Task<Evaluation> UpdateAsync(int id, UpdateEvaluationRequestDto dto);
        Task<Evaluation> DeleteAsync(int id);
    }
}
