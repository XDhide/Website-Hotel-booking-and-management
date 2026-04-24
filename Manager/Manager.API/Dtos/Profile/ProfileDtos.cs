namespace Manager.API.Dtos.Profile
{
    public class ProfileDto
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
    }

    public class UpdateProfileRequestDto
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
    }

    public class ChangePasswordRequestDto
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
}
