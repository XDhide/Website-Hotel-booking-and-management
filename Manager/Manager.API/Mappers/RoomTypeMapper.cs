using System;
using System.Linq;
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
                Id             = model.Id,
                Name           = model.Name,
                Capacity       = model.Capacity,
                Description    = model.Description,
                TotalRooms     = model.Rooms?.Count ?? 0,
                AvailableRooms = model.Rooms?.Count(r => r.CurrentStatus == "Available") ?? 0,
                CreatedAt      = model.CreatedAt,
                UpdatedAt      = model.UpdatedAt,
                Images         = model.Images?
                    .OrderBy(i => i.DisplayOrder)
                    .Select(i => i.ToRoomTypeImageDto())
                    .ToList() ?? new(),
            };
        }

        public static RoomTypeImageDto ToRoomTypeImageDto(this RoomTypeImage img)
        {
            return new RoomTypeImageDto
            {
                Id = img.Id,
                RoomTypeId = img.RoomTypeId,
                ImageUrl = img.ImageUrl,
                AltText = img.AltText,
                DisplayOrder = img.DisplayOrder,
                CreatedAt = img.CreatedAt,
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

        public static RoomTypeImage ToRoomTypeImageModel(this CreateRoomTypeImageRequestDto dto, int roomTypeId)
        {
            return new RoomTypeImage
            {
                RoomTypeId = roomTypeId,
                ImageUrl = dto.ImageUrl,
                AltText = dto.AltText,
                DisplayOrder = dto.DisplayOrder,
                CreatedAt = DateTime.Now,
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
