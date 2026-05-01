namespace Manager.API.Dtos.RoomType
{
    public class CreateRoomTypeImageRequestDto
    {
        public string ImageUrl { get; set; }
        public string AltText { get; set; }
        public int DisplayOrder { get; set; }
    }
}
