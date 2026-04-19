using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    public class Evaluation
    {
        [Key]
        public int EvaluationId { get; set; }
        public string UserId { get; set; }
        public int RoomUseId { get; set; }
        public int? Rating { get; set; }
        public string Comment { get; set; }
        public DateTime? CreatedAt { get; set; }

        // Navigation
        public AppUser User { get; set; }

        // Navigation
        public RoomInUse RoomInUse { get; set; }
    }
}
