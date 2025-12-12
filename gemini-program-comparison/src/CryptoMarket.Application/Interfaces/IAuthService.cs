using CryptoMarket.Application.DTOs.Auth;
using CryptoMarket.Domain.Entities;

namespace CryptoMarket.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request);
    Task RevokeTokenAsync(string username);
}
