using System;

namespace Manager.API.Dtos.RoomRate
{
    public class RoomRateDto
    {
        public int RoomRateId { get; set; }
        public int RoomTypeId { get; set; }
        public string RentType { get; set; }
        public double? Price { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
