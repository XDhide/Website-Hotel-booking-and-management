using System;
using System.Collections.Generic;

namespace Manager.API.Dtos.RoomType
{
    public class RoomTypeDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Capacity { get; set; }
        public string Description { get; set; }
        public int TotalRooms { get; set; }
        public int AvailableRooms { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<RoomTypeImageDto> Images { get; set; } = new();
    }
}
