namespace Manager.API.Dtos.Rooms
{
    public class CreateRoomsRequestDto
    {
        public string RoomNumber { get; set; }
        public int RoomTypeId { get; set; }
        public string CurrentStatus { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
