using System;
using Manager.API.Dtos.Surcharge;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class SurchargeMapper
    {
        public static SurchargeDto ToSurchargeDto(this Surcharge model)
        {
            return new SurchargeDto
            {
                Id = model.Id,
                Name = model.Name,
                Price = model.Price,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }

        public static Surcharge ToCreateSurchargeModel(this CreateSurchargeRequestDto dto)
        {
            return new Surcharge
            {
                Name = dto.Name,
                Price = dto.Price,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt,
            };
        }

        public static UpdateSurchargeRequestDto ToUpdateSurchargeRequestDto(this Surcharge model)
        {
            return new UpdateSurchargeRequestDto
            {
                Name = model.Name,
                Price = model.Price,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }
    }
}
