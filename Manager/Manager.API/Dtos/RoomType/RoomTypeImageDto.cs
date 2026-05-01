using System;

namespace Manager.API.Dtos.RoomType
{
    public class RoomTypeImageDto
    {
        public int Id { get; set; }
        public int RoomTypeId { get; set; }
        public string ImageUrl { get; set; }
        public string AltText { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
