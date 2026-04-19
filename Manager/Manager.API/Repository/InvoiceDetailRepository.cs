using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.InvoiceDetail;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class InvoiceDetailRepository : IInvoiceDetailRepository
    {
        private readonly ApplicationDBContext _dBContext;

        public InvoiceDetailRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public async Task<InvoiceDetail> CreateAsync(int InvoiceId, InvoiceDetail model)
        {
            var invoice = await _dBContext.Invoices.FirstOrDefaultAsync(s => s.InvoiceId == InvoiceId);
            if (invoice == null)
                throw new Exception("Invoice not found");

            var newModel = new InvoiceDetail
            {
                InvoiceId = model.InvoiceId,
                ItemType = model.ItemType,
                ItemId = model.ItemId,
                ItemName = model.ItemName,
                UnitPrice = model.UnitPrice,
                Quantity = model.Quantity,
                TotalPrice = model.TotalPrice,
                CreatedAt = DateTime.Now,
            };
            await _dBContext.InvoiceDetails.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();
            return newModel;
        }

        public async Task<InvoiceDetail> DeleteAsync(int id)
        {
            var model = await _dBContext.InvoiceDetails.FirstOrDefaultAsync(s => s.InvoiceDetailId == id);
            if (model == null)
                return null;
            _dBContext.InvoiceDetails.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<InvoiceDetail>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.InvoiceDetails.AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query.OrderByDescending(r => r.InvoiceDetailId).Skip((page - 1) * limit).Take(limit).ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<InvoiceDetail>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<InvoiceDetail> GetByIdAsync(int id)
        {
            return await _dBContext.InvoiceDetails.FindAsync(id);
        }

        public async Task<InvoiceDetail> UpdateAsync(int id, UpdateInvoiceDetailRequestDto dto)
        {
            var model = await _dBContext.InvoiceDetails.FirstOrDefaultAsync(s => s.InvoiceDetailId == id);
            if (model == null)
                return null;
            var invoice = await _dBContext.Invoices.FirstOrDefaultAsync(s => s.InvoiceId == dto.InvoiceId);
            if (invoice == null)
                throw new Exception("Invoice not found");
            model.InvoiceId = dto.InvoiceId;
            model.ItemType = dto.ItemType;
            model.ItemId = dto.ItemId;
            model.ItemName = dto.ItemName;
            model.UnitPrice = dto.UnitPrice;
            model.Quantity = dto.Quantity;
            model.TotalPrice = dto.TotalPrice;
            model.CreatedAt = dto.CreatedAt;
            await _dBContext.SaveChangesAsync();
            return model;
        }
    }
}
