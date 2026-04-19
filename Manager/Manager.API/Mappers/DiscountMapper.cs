using System;
using Manager.API.Dtos.Discount;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class DiscountMapper
    {
        public static DiscountDto ToDiscountDto(this Discount model)
        {
            return new DiscountDto
            {
                DiscountId = model.DiscountId,
                Name = model.Name,
                DiscountType = model.DiscountType,
                DiscountValue = model.DiscountValue,
                MinAmount = model.MinAmount,
                MaxDiscount = model.MaxDiscount,
                FromDate = model.FromDate,
                ToDate = model.ToDate,
                IsActive = model.IsActive,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }

        public static Discount ToCreateDiscountModel(this CreateDiscountRequestDto dto)
        {
            return new Discount
            {
                Name = dto.Name,
                DiscountType = dto.DiscountType,
                DiscountValue = dto.DiscountValue,
                MinAmount = dto.MinAmount,
                MaxDiscount = dto.MaxDiscount,
                FromDate = dto.FromDate,
                ToDate = dto.ToDate,
                IsActive = dto.IsActive,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = DateTime.Now,
            };
        }

        public static UpdateDiscountRequestDto ToUpdateDiscountRequestDto(this Discount model)
        {
            return new UpdateDiscountRequestDto
            {
                Name = model.Name,
                DiscountType = model.DiscountType,
                DiscountValue = model.DiscountValue,
                MinAmount = model.MinAmount,
                MaxDiscount = model.MaxDiscount,
                FromDate = model.FromDate,
                ToDate = model.ToDate,
                IsActive = model.IsActive,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }
    }
}
