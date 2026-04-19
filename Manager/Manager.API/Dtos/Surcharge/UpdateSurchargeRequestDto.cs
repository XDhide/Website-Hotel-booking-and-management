namespace Manager.API.Dtos.Surcharge
{
    public class UpdateSurchargeRequestDto
    {
        public string Name { get; set; }
        public double? Price { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
