using System.ComponentModel.DataAnnotations;

namespace Manager.API.Dtos.Profile
{
    public class UpdateProfileRequestDto
    {
        [EmailAddress]
        public string? Email { get; set; }
        
        [Phone]
        public string? PhoneNumber { get; set; }
        
        public string? UserName { get; set; }
    }
}
