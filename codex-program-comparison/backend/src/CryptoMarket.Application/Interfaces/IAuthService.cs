using CryptoMarket.Application.DTOs.Auth;

namespace CryptoMarket.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse?> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse?> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default);
    Task LogoutAsync(Guid userId, RefreshRequest request, CancellationToken cancellationToken = default);
    Task<MeResponse?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default);
}
