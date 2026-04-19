using Manager.API.Data;
using Manager.API.Dtos.Invoice;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class InvoiceRepository : IInvoiceRepository
    {
        private readonly ApplicationDBContext _context;
        public InvoiceRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<Invoice>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;

            var query = _context.Invoices.AsQueryable();

            var totalCount = await query.CountAsync();

            var data = await query
                .OrderBy(i => i.Id)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            var totalPages = totalCount == 0
                ? 0
                : (int)Math.Ceiling((double)totalCount / limit);

            return new PagedResult<Invoice>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<Invoice?> GetByIdAsync(int id)
        {
            return await _context.Invoices.FindAsync(id);
        }

        public async Task<Invoice> CreateAsync(Invoice invoice)
        {
            invoice.CreateAt = DateTime.Now;
            invoice.UpdateAt = DateTime.Now;
            invoice.Status = "Unpaid";
            await _context.Invoices.AddAsync(invoice);
            await _context.SaveChangesAsync();
            return invoice;
        }

        public async Task<Invoice?> UpdateAsync(int id, UpdateInvoiceDto dto)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null) return null;

            invoice.RoomCharge = dto.RoomCharge;
            invoice.ServiceCharge = dto.ServiceCharge;
            invoice.Discount = dto.Discount;
            invoice.TotalAmount = dto.TotalAmount;
            invoice.Status = dto.Status;
            invoice.UpdateAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return invoice;
        }

        public async Task<Invoice?> DeleteAsync(int id)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null) return null;

            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();
            return invoice;
        }
    }
}