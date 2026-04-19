namespace Manager.API.Dtos.Services
{
    public class UpdateServicesRequestDto
    {
        public string ServiceType { get; set; }
        public string Name { get; set; }
        public double? Price { get; set; }
        public string Unit { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
