namespace Manager.API.Dtos.Discount
{
    public class UpdateDiscountRequestDto
    {
        public string Name { get; set; }
        public string DiscountType { get; set; }
        public double? DiscountValue { get; set; }
        public double? MinAmount { get; set; }
        public double? MaxDiscount { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
