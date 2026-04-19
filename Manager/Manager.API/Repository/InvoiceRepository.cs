using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Manager.API.Data;
using Manager.API.Dtos.Invoice;
using Manager.API.Interfaces;
using Manager.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Manager.API.Repository
{
    public class InvoiceRepository : IInvoiceRepository
    {
        private readonly ApplicationDBContext _dBContext;

        public InvoiceRepository(ApplicationDBContext dBContext)
        {
            _dBContext = dBContext;
        }

        public async Task<Invoice> CreateAsync(string UserId, int RoomInUseId, Invoice model)
        {
            var user = await _dBContext.Users.FirstOrDefaultAsync(s => s.Id == UserId);
            if (user == null)
                throw new Exception("User not found");

            var roomInUse = await _dBContext.RoomInUses.FirstOrDefaultAsync(s => s.RoomUseId == RoomInUseId);
            if (roomInUse == null)
                throw new Exception("RoomInUse not found");

            var newModel = new Invoice
            {
                RoomUseId = model.RoomUseId,
                UserId = model.UserId,
                SubTotal = model.SubTotal,
                DiscountAmount = model.DiscountAmount,
                SurchargeAmount = model.SurchargeAmount,
                FinalAmount = model.FinalAmount,
                PaymentStatus = model.PaymentStatus,
                PaymentMethod = model.PaymentMethod,
                PaidAt = model.PaidAt,
                Note = model.Note,
                CreatedAt = DateTime.Now,
                UpdatedAt = model.UpdatedAt,
            };
            await _dBContext.Invoices.AddAsync(newModel);
            await _dBContext.SaveChangesAsync();
            return newModel;
        }

        public async Task<Invoice> DeleteAsync(int id)
        {
            var model = await _dBContext.Invoices.FirstOrDefaultAsync(s => s.InvoiceId == id);
            if (model == null)
                return null;
            _dBContext.Invoices.Remove(model);
            await _dBContext.SaveChangesAsync();
            return model;
        }

        public async Task<PagedResult<Invoice>> GetAllAsync(int page, int limit)
        {
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            var query = _dBContext.Invoices.AsQueryable();
            var totalCount = await query.CountAsync();
            var data = await query.OrderByDescending(r => r.InvoiceId).Skip((page - 1) * limit).Take(limit).ToListAsync();
            int totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling((double)totalCount / limit);
            return new PagedResult<Invoice>
            {
                Page = page,
                Limit = limit,
                TotalCount = totalCount,
                TotalPages = totalPages,
                Data = data
            };
        }

        public async Task<Invoice> GetByIdAsync(int id)
        {
            return await _dBContext.Invoices.FindAsync(id);
        }

        public async Task<Invoice> UpdateAsync(int id, UpdateInvoiceRequestDto dto)
        {
            var model = await _dBContext.Invoices.FirstOrDefaultAsync(s => s.InvoiceId == id);
            if (model == null)
                return null;
            var user = await _dBContext.Users.FirstOrDefaultAsync(s => s.Id == dto.UserId);
            if (user == null)
                throw new Exception("User not found");
            var roomInUse = await _dBContext.RoomInUses.FirstOrDefaultAsync(s => s.RoomUseId == dto.RoomUseId);
            if (roomInUse == null)
                throw new Exception("RoomInUse not found");
            model.RoomUseId = dto.RoomUseId;
            model.UserId = dto.UserId;
            model.SubTotal = dto.SubTotal;
            model.DiscountAmount = dto.DiscountAmount;
            model.SurchargeAmount = dto.SurchargeAmount;
            model.FinalAmount = dto.FinalAmount;
            model.PaymentStatus = dto.PaymentStatus;
            model.PaymentMethod = dto.PaymentMethod;
            model.PaidAt = dto.PaidAt;
            model.Note = dto.Note;
            model.CreatedAt = dto.CreatedAt;
            model.UpdatedAt = DateTime.Now;
            await _dBContext.SaveChangesAsync();
            return model;
        }
    }
}
