using Manager.API.Models;

namespace Manager.API.Interfaces
{
    public interface ITokenService
    {
        Task<string> createToken(AppUser user);
    }
}