using System;
using Manager.API.Dtos.RoomInUse;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class RoomInUseMapper
    {
        public static RoomInUseDto ToRoomInUseDto(this RoomInUse model)
        {
            return new RoomInUseDto
            {
                RoomUseId = model.RoomUseId,
                BookingId = model.BookingId,
                RoomId = model.RoomId,
                RentType = model.RentType,
                CheckInActual = model.CheckInActual,
                CheckOutActual = model.CheckOutActual,
                PricePerUnit = model.PricePerUnit,
                TotalAmount = model.TotalAmount,
                Status = model.Status,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }

        public static RoomInUse ToCreateRoomInUseModel(this CreateRoomInUseRequestDto dto)
        {
            return new RoomInUse
            {
                BookingId = dto.BookingId,
                RoomId = dto.RoomId,
                RentType = dto.RentType,
                CheckInActual = dto.CheckInActual,
                CheckOutActual = dto.CheckOutActual,
                PricePerUnit = dto.PricePerUnit,
                TotalAmount = dto.TotalAmount,
                Status = dto.Status,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt,
            };
        }

        public static UpdateRoomInUseRequestDto ToUpdateRoomInUseRequestDto(this RoomInUse model)
        {
            return new UpdateRoomInUseRequestDto
            {
                BookingId = model.BookingId,
                RoomId = model.RoomId,
                RentType = model.RentType,
                CheckInActual = model.CheckInActual,
                CheckOutActual = model.CheckOutActual,
                PricePerUnit = model.PricePerUnit,
                TotalAmount = model.TotalAmount,
                Status = model.Status,
                CreatedAt = model.CreatedAt,
                UpdatedAt = model.UpdatedAt,
            };
        }
    }
}
