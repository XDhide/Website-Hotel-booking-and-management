using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Manager.API.Models
{
    public class UserFavorite
    {
        [Key]
        public int FavoriteId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public int RoomTypeId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public AppUser User { get; set; } = null!;

        [ForeignKey("RoomTypeId")]
        public RoomType RoomType { get; set; } = null!;
    }
}
