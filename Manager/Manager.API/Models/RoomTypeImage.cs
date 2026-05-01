using System;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    public class RoomTypeImage
    {
        [Key]
        public int Id { get; set; }
        public int RoomTypeId { get; set; }
        public string ImageUrl { get; set; }
        public string AltText { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime? CreatedAt { get; set; }

        public RoomType RoomType { get; set; }
    }
}
