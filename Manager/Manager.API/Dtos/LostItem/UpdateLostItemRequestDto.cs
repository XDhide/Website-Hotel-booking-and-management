namespace Manager.API.Dtos.LostItem
{
    public class UpdateLostItemRequestDto
    {
        public int? RoomId { get; set; }
        public int? RoomUseId { get; set; }
        public string ItemName { get; set; }
        public string Description { get; set; }
        public DateTime? FoundAt { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
