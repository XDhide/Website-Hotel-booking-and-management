namespace Manager.API.Dtos.Master
{
    public class CreateMasterRequestDto
    {
        public string Name { get; set; }
        public string Content { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
