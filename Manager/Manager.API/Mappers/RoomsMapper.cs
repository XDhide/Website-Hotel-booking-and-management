using System;
using Manager.API.Dtos.Rooms;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class RoomsMapper
    {
        public static RoomsDto ToRoomsDto(this Rooms model)
        {
            return new RoomsDto
            {
                RoomId = model.RoomId,
                RoomNumber = model.RoomNumber,
                RoomTypeId = model.RoomTypeId,
                CurrentStatus = model.CurrentStatus,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }

        public static Rooms ToCreateRoomsModel(this CreateRoomsRequestDto dto)
        {
            return new Rooms
            {
                RoomNumber = dto.RoomNumber,
                RoomTypeId = dto.RoomTypeId,
                CurrentStatus = dto.CurrentStatus,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt,
            };
        }

        public static UpdateRoomsRequestDto ToUpdateRoomsRequestDto(this Rooms model)
        {
            return new UpdateRoomsRequestDto
            {
                RoomNumber = model.RoomNumber,
                RoomTypeId = model.RoomTypeId,
                CurrentStatus = model.CurrentStatus,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }
    }
}
