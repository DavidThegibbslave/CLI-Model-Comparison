using CryptoMarket.Domain.Entities;
using System.Security.Claims;

namespace CryptoMarket.Application.Interfaces.Services;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    Task<RefreshToken> GenerateRefreshTokenAsync(Guid userId);
    ClaimsPrincipal? ValidateAccessToken(string token);
    Task<RefreshToken?> ValidateRefreshTokenAsync(string token);
}
