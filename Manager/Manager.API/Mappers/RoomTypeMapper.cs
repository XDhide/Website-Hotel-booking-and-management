using System;
using Manager.API.Dtos.RoomType;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class RoomTypeMapper
    {
        public static RoomTypeDto ToRoomTypeDto(this RoomType model)
        {
            return new RoomTypeDto
            {
                Id = model.Id,
                Name = model.Name,
                Capacity = model.Capacity,
                Description = model.Description,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }

        public static RoomType ToCreateRoomTypeModel(this CreateRoomTypeRequestDto dto)
        {
            return new RoomType
            {
                Name = dto.Name,
                Capacity = dto.Capacity,
                Description = dto.Description,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt,
            };
        }

        public static UpdateRoomTypeRequestDto ToUpdateRoomTypeRequestDto(this RoomType model)
        {
            return new UpdateRoomTypeRequestDto
            {
                Name = model.Name,
                Capacity = model.Capacity,
                Description = model.Description,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }
    }
}
