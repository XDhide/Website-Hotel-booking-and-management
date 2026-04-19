namespace Manager.API.Dtos.Evaluation
{
    public class UpdateEvaluationRequestDto
    {
        public string UserId { get; set; }
        public int RoomUseId { get; set; }
        public int? Rating { get; set; }
        public string Comment { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
