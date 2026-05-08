using System;

namespace Manager.API.Dtos.Favorite
{
    public class FavoriteDto
    {
        public int FavoriteId { get; set; }
        public int RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class AddFavoriteRequestDto
    {
        public int RoomTypeId { get; set; }
    }
}
