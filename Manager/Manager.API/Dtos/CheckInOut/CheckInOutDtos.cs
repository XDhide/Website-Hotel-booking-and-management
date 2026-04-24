using System;

namespace Manager.API.Dtos.CheckInOut
{
    public class CheckInRequestDto
    {
        public int BookingId { get; set; }
    }

    public class CheckOutRequestDto
    {
        public int BookingId { get; set; }
    }

    public class TransferRoomRequestDto
    {
        public int BookingId { get; set; }
        public int NewRoomId { get; set; }
    }

    public class ExtendBookingRequestDto
    {
        public int BookingId { get; set; }
        public DateTime NewCheckOutDate { get; set; }
    }

    public class CheckInOutResultDto
    {
        public int BookingId { get; set; }
        public string Status { get; set; }
        public string Message { get; set; }
        public DateTime? ActualDate { get; set; }
    }
}
