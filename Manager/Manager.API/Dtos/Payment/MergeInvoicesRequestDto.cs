using System.ComponentModel.DataAnnotations;

namespace Manager.API.Dtos.Payment
{
    public class MergeInvoicesRequestDto
    {
        [Required]
        [MinLength(2)]
        public List<int> BookingIds { get; set; }
    }
}
