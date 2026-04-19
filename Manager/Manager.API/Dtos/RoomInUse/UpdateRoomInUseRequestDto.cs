namespace Manager.API.Dtos.RoomInUse
{
    public class UpdateRoomInUseRequestDto
    {
        public int BookingId { get; set; }
        public int RoomId { get; set; }
        public string RentType { get; set; }
        public DateTime? CheckInActual { get; set; }
        public DateTime? CheckOutActual { get; set; }
        public double? PricePerUnit { get; set; }
        public double? TotalAmount { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
