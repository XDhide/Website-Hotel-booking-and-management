using System;
using System.ComponentModel.DataAnnotations;

namespace Manager.API.Models
{
    // NOTE: Model này ánh xạ sang bảng Evaluations đã có sẵn.
    // Chỉ thêm nếu bạn muốn tách riêng Review khỏi Evaluation.
    // Nếu dùng chung Evaluation thì bỏ file này và trỏ /api/Review → EvaluationController.

    public class Review
    {
        [Key]
        public int Id { get; set; }

        public string UserId { get; set; }

        public int? BookingId { get; set; }

        public int? RoomId { get; set; }

        public int Rating { get; set; }

        public string Comment { get; set; }

        public DateTime? CreatedAt { get; set; }

        // Navigation
        public AppUser User { get; set; }
    }
}
