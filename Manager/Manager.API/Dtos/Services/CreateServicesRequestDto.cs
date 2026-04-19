namespace Manager.API.Dtos.Services
{
    public class CreateServicesRequestDto
    {
        public string ServiceType { get; set; }
        public string Name { get; set; }
        public double? Price { get; set; }
        public string Unit { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
