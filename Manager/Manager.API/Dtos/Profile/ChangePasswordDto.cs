using System.ComponentModel.DataAnnotations;

namespace Manager.API.Dtos.Profile
{
    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; }
        
        [Required]
        [MinLength(8)]
        public string NewPassword { get; set; }
        
        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; }
    }
}
