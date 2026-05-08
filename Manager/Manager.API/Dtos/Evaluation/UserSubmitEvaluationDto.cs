using System.ComponentModel.DataAnnotations;

namespace Manager.API.Dtos.Evaluation
{
    /// <summary>
    /// DTO dùng khi user tự gửi đánh giá phòng sau khi checkout và thanh toán xong.
    /// UserId được lấy từ JWT token, không cần truyền từ client.
    /// </summary>
    public class UserSubmitEvaluationDto
    {
        [Required(ErrorMessage = "RoomUseId là bắt buộc.")]
        public int RoomUseId { get; set; }

        [Required(ErrorMessage = "Rating là bắt buộc.")]
        [Range(1, 5, ErrorMessage = "Rating phải từ 1 đến 5.")]
        public int Rating { get; set; }

        [MaxLength(500, ErrorMessage = "Nhận xét không được vượt quá 500 ký tự.")]
        public string Comment { get; set; }
    }
}
