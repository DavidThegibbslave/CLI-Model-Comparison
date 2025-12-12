using CryptoMarket.Application.DTOs.Auth;

namespace CryptoMarket.Application.Interfaces.Services;

public interface IAuthService
{
    Task<TokenDto> RegisterAsync(RegisterDto registerDto);
    Task<TokenDto> LoginAsync(LoginDto loginDto);
    Task<TokenDto> RefreshTokenAsync(string refreshToken);
    Task RevokeTokenAsync(string refreshToken);
    Task<UserDto> GetCurrentUserAsync(Guid userId);
}
