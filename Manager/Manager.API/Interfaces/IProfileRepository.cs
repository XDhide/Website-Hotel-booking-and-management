using System.Threading.Tasks;
using Manager.API.Dtos.Profile;

namespace Manager.API.Interfaces
{
    public interface IProfileRepository
    {
        Task<ProfileDto> GetProfileAsync(string userId);
        Task<ProfileDto> UpdateProfileAsync(string userId, UpdateProfileRequestDto dto);
        Task ChangePasswordAsync(string userId, ChangePasswordRequestDto dto);
    }
}
