using System;
using Manager.API.Dtos.Services;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class ServicesMapper
    {
        public static ServicesDto ToServicesDto(this Services model)
        {
            return new ServicesDto
            {
                Id = model.Id,
                ServiceType = model.ServiceType,
                Name = model.Name,
                Price = model.Price,
                Unit = model.Unit,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }

        public static Services ToCreateServicesModel(this CreateServicesRequestDto dto)
        {
            return new Services
            {
                ServiceType = dto.ServiceType,
                Name = dto.Name,
                Price = dto.Price,
                Unit = dto.Unit,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = DateTime.Now,
            };
        }

        public static UpdateServicesRequestDto ToUpdateServicesRequestDto(this Services model)
        {
            return new UpdateServicesRequestDto
            {
                ServiceType = model.ServiceType,
                Name = model.Name,
                Price = model.Price,
                Unit = model.Unit,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }
    }
}
