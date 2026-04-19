using System;
using Manager.API.Dtos.RoomRate;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class RoomRateMapper
    {
        public static RoomRateDto ToRoomRateDto(this RoomRate model)
        {
            return new RoomRateDto
            {
                RoomRateId = model.RoomRateId,
                RoomTypeId = model.RoomTypeId,
                RentType = model.RentType,
                Price = model.Price,
                FromDate = model.FromDate,
                ToDate = model.ToDate,
                IsActive = model.IsActive,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }

        public static RoomRate ToCreateRoomRateModel(this CreateRoomRateRequestDto dto)
        {
            return new RoomRate
            {
                RoomTypeId = dto.RoomTypeId,
                RentType = dto.RentType,
                Price = dto.Price,
                FromDate = dto.FromDate,
                ToDate = dto.ToDate,
                IsActive = dto.IsActive,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt,
            };
        }

        public static UpdateRoomRateRequestDto ToUpdateRoomRateRequestDto(this RoomRate model)
        {
            return new UpdateRoomRateRequestDto
            {
                RoomTypeId = model.RoomTypeId,
                RentType = model.RentType,
                Price = model.Price,
                FromDate = model.FromDate,
                ToDate = model.ToDate,
                IsActive = model.IsActive,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }
    }
}
