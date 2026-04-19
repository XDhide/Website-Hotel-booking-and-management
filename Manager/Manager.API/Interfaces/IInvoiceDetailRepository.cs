using System.Collections.Generic;
using System.Threading.Tasks;
using Manager.API.Dtos.InvoiceDetail;
using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface IInvoiceDetailRepository
    {
        Task<PagedResult<InvoiceDetail>> GetAllAsync(int page, int limit);
        Task<InvoiceDetail> GetByIdAsync(int id);
        Task<InvoiceDetail> CreateAsync(int InvoiceId, InvoiceDetail model);
        Task<InvoiceDetail> UpdateAsync(int id, UpdateInvoiceDetailRequestDto dto);
        Task<InvoiceDetail> DeleteAsync(int id);
    }
}
