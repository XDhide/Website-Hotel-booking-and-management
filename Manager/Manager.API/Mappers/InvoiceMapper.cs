using System;
using Manager.API.Dtos.Invoice;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class InvoiceMapper
    {
        public static InvoiceDto ToInvoiceDto(this Invoice model)
        {
            return new InvoiceDto
            {
                InvoiceId = model.InvoiceId,
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
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }

        public static Invoice ToCreateInvoiceModel(this CreateInvoiceRequestDto dto)
        {
            return new Invoice
            {
                RoomUseId = dto.RoomUseId,
                UserId = dto.UserId,
                SubTotal = dto.SubTotal,
                DiscountAmount = dto.DiscountAmount,
                SurchargeAmount = dto.SurchargeAmount,
                FinalAmount = dto.FinalAmount,
                PaymentStatus = dto.PaymentStatus,
                PaymentMethod = dto.PaymentMethod,
                PaidAt = dto.PaidAt,
                Note = dto.Note,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt,
            };
        }

        public static UpdateInvoiceRequestDto ToUpdateInvoiceRequestDto(this Invoice model)
        {
            return new UpdateInvoiceRequestDto
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
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }
    }
}
