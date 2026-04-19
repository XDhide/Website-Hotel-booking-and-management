using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.Messenger;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IMessengerRepository
    {
        Task<PagedResult<Messenger>> GetAllAsync(int page, int limit);
        Task<Messenger> GetByIdAsync(int id);
        Task<Messenger> CreateAsync(string UserId, int MessengerBoxId, Messenger model);
        Task<Messenger> UpdateAsync(int id, UpdateMessengerRequestDto dto);
        Task<Messenger> DeleteAsync(int id);
    }
}
