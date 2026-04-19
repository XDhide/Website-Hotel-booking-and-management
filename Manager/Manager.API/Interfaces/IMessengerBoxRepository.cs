using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.MessengerBox;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IMessengerBoxRepository
    {
        Task<PagedResult<MessengerBox>> GetAllAsync(int page, int limit);
        Task<MessengerBox> GetByIdAsync(int id);
        Task<MessengerBox> CreateAsync(string UserId, MessengerBox model);
        Task<MessengerBox> UpdateAsync(int id, UpdateMessengerBoxRequestDto dto);
        Task<MessengerBox> DeleteAsync(int id);
    }
}
