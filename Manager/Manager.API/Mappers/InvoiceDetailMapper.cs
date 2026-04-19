using System;
using Manager.API.Dtos.InvoiceDetail;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class InvoiceDetailMapper
    {
        public static InvoiceDetailDto ToInvoiceDetailDto(this InvoiceDetail model)
        {
            return new InvoiceDetailDto
            {
                InvoiceDetailId = model.InvoiceDetailId,
                InvoiceId = model.InvoiceId,
                ItemType = model.ItemType,
                ItemId = model.ItemId,
                ItemName = model.ItemName,
                UnitPrice = model.UnitPrice,
                Quantity = model.Quantity,
                TotalPrice = model.TotalPrice,
                CreatedAt = model.CreatedAt,
            };
        }

        public static InvoiceDetail ToCreateInvoiceDetailModel(this CreateInvoiceDetailRequestDto dto)
        {
            return new InvoiceDetail
            {
                InvoiceId = dto.InvoiceId,
                ItemType = dto.ItemType,
                ItemId = dto.ItemId,
                ItemName = dto.ItemName,
                UnitPrice = dto.UnitPrice,
                Quantity = dto.Quantity,
                TotalPrice = dto.TotalPrice,
                CreatedAt = dto.CreatedAt,
            };
        }

        public static UpdateInvoiceDetailRequestDto ToUpdateInvoiceDetailRequestDto(this InvoiceDetail model)
        {
            return new UpdateInvoiceDetailRequestDto
            {
                InvoiceId = model.InvoiceId,
                ItemType = model.ItemType,
                ItemId = model.ItemId,
                ItemName = model.ItemName,
                UnitPrice = model.UnitPrice,
                Quantity = model.Quantity,
                TotalPrice = model.TotalPrice,
                CreatedAt = model.CreatedAt,
            };
        }
    }
}
