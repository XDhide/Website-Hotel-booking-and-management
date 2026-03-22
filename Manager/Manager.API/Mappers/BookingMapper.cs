using Manager.API.Dtos.Booking;
using Manager.API.Models;

namespace Manager.API.Mappers
{
    public static class BookingMapper
    {
        public static BookingDto ToBookingDto(this Booking booking)
        {
            return new BookingDto
            {
                Id = booking.Id,
                UserId = booking.UserId,
                RoomId = booking.RoomId,
                RoomNumber = booking.Room?.RoomNumber ?? "",
                CheckInDate = booking.CheckInDate,
                CheckOutDate = booking.CheckOutDate,
                NumberOfGuests = booking.NumberOfGuests,
                Status = booking.Status,
                TotalAmount = booking.TotalAmount,
                SpecialRequests = booking.SpecialRequests,
                CreatedAt = booking.CreatedAt
            };
        }

        public static Booking ToBookingFromCreate(this CreateBookingRequestDto dto, string userId)
        {
            return new Booking
            {
                UserId = userId,
                RoomId = dto.RoomId,
                CheckInDate = dto.CheckInDate,
                CheckOutDate = dto.CheckOutDate,
                NumberOfGuests = dto.NumberOfGuests,
                Status = "Pending",
                SpecialRequests = dto.SpecialRequests,
                TotalAmount = 0
            };
        }
    }
}
