using System;
using Manager.API.Dtos.LostItem;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class LostItemMapper
    {
        public static LostItemDto ToLostItemDto(this LostItem model)
        {
            return new LostItemDto
            {
                LostItemId = model.LostItemId,
                RoomId = model.RoomId,
                RoomUseId = model.RoomUseId,
                ItemName = model.ItemName,
                Description = model.Description,
                FoundAt = model.FoundAt,
                Status = model.Status,
                CreatedAt = model.CreatedAt,
            };
        }

        public static LostItem ToCreateLostItemModel(this CreateLostItemRequestDto dto)
        {
            return new LostItem
            {
                RoomId = dto.RoomId,
                RoomUseId = dto.RoomUseId,
                ItemName = dto.ItemName,
                Description = dto.Description,
                FoundAt = dto.FoundAt,
                Status = dto.Status,
                CreatedAt = dto.CreatedAt,
            };
        }

        public static UpdateLostItemRequestDto ToUpdateLostItemRequestDto(this LostItem model)
        {
            return new UpdateLostItemRequestDto
            {
                RoomId = model.RoomId,
                RoomUseId = model.RoomUseId,
                ItemName = model.ItemName,
                Description = model.Description,
                FoundAt = model.FoundAt,
                Status = model.Status,
                CreatedAt = model.CreatedAt,
            };
        }
    }
}
