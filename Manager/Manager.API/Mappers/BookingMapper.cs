using System;
using Manager.API.Dtos.Booking;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class BookingMapper
    {
        public static BookingDto ToBookingDto(this Booking model)
        {
            return new BookingDto
            {
                Id = model.Id,
                UserId = model.UserId,
                RoomTypeId = model.RoomTypeId,
                Deposit = model.Deposit,
                FromDate = model.FromDate,
                ToDate = model.ToDate,
                Status = model.Status,
                CreatedAt = model.CreatedAt,
            };
        }

        public static Booking ToCreateBookingModel(this CreateBookingRequestDto dto)
        {
            return new Booking
            {
                UserId = dto.UserId,
                RoomTypeId = dto.RoomTypeId,
                Deposit = dto.Deposit,
                FromDate = dto.FromDate,
                ToDate = dto.ToDate,
                Status = dto.Status,
                CreatedAt = DateTime.Now,
            };
        }

        public static UpdateBookingRequestDto ToUpdateBookingRequestDto(this Booking model)
        {
            return new UpdateBookingRequestDto
            {
                UserId = model.UserId,
                RoomTypeId = model.RoomTypeId,
                Deposit = model.Deposit,
                FromDate = model.FromDate,
                ToDate = model.ToDate,
                Status = model.Status,
                CreatedAt = model.CreatedAt,
            };
        }
    }
}
