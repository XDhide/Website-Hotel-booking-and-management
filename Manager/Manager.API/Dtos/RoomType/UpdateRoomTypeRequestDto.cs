namespace Manager.API.Dtos.RoomType
{
    public class UpdateRoomTypeRequestDto
    {
        public string Name { get; set; }
        public string Capacity { get; set; }
        public string Description { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
