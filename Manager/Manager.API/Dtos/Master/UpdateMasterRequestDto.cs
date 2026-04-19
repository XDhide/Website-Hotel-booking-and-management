namespace Manager.API.Dtos.Master
{
    public class UpdateMasterRequestDto
    {
        public string Name { get; set; }
        public string Content { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
