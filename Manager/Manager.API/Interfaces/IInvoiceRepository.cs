using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.Invoice;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IInvoiceRepository
    {
        Task<PagedResult<Invoice>> GetAllAsync(int page, int limit);
        Task<Invoice> GetByIdAsync(int id);
        Task<Invoice> CreateAsync(string UserId, int RoomInUseId, Invoice model);
        Task<Invoice> UpdateAsync(int id, UpdateInvoiceRequestDto dto);
        Task<Invoice> DeleteAsync(int id);
    }
}
