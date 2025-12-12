using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BCryptNet = BCrypt.Net.BCrypt;
using CryptoMarket.Application.DTOs.Auth;
using CryptoMarket.Application.Interfaces;
using CryptoMarket.Application.Options;
using CryptoMarket.Domain.Entities;
using CryptoMarket.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CryptoMarket.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _dbContext;
    private readonly AuthTokenOptions _tokenOptions;
    private readonly ILogger<AuthService> _logger;

    public AuthService(AppDbContext dbContext, IOptions<AuthTokenOptions> tokenOptions, ILogger<AuthService> logger)
    {
        _dbContext = dbContext;
        _tokenOptions = tokenOptions.Value;
        _logger = logger;
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await _dbContext.Users.AnyAsync(u => u.Email == email, cancellationToken))
        {
            return null;
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = BCryptNet.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        var defaultRole = await EnsureRoleAsync("User", cancellationToken);
        user.Roles.Add(defaultRole);

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _dbContext.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (user is null)
        {
            return null;
        }

        var valid = BCryptNet.Verify(request.Password, user.PasswordHash);
        if (!valid)
        {
            return null;
        }

        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<AuthResponse?> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default)
    {
        var hashed = HashToken(request.RefreshToken);
        var existing = await _dbContext.RefreshTokens
            .Include(rt => rt.User)
            .ThenInclude(u => u.Roles)
            .FirstOrDefaultAsync(rt => rt.TokenHash == hashed, cancellationToken);

        if (existing is null || existing.RevokedAt != null || existing.ExpiresAt <= DateTime.UtcNow)
        {
            return null;
        }

        existing.RevokedAt = DateTime.UtcNow;
        var response = await IssueTokensAsync(existing.User!, cancellationToken, existing);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return response;
    }

    public async Task LogoutAsync(Guid userId, RefreshRequest request, CancellationToken cancellationToken = default)
    {
        var hashed = HashToken(request.RefreshToken);
        var token = await _dbContext.RefreshTokens.FirstOrDefaultAsync(rt => rt.UserId == userId && rt.TokenHash == hashed, cancellationToken);
        if (token != null)
        {
            token.RevokedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<MeResponse?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user == null)
        {
            return null;
        }

        return new MeResponse
        {
            UserId = user.Id,
            Email = user.Email,
            Roles = user.Roles.Select(r => r.Name).ToArray()
        };
    }

    private async Task<AuthResponse> IssueTokensAsync(User user, CancellationToken cancellationToken, RefreshToken? replacedToken = null)
    {
        var roles = user.Roles.Any() ? user.Roles.Select(r => r.Name).ToArray() : Array.Empty<string>();

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_tokenOptions.Key));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddMinutes(_tokenOptions.AccessTokenMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.NameIdentifier, user.Id.ToString())
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var token = new JwtSecurityToken(
            issuer: _tokenOptions.Issuer,
            audience: _tokenOptions.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

        var refreshToken = GenerateRefreshToken();
        var refreshTokenHash = HashToken(refreshToken);
        var newRefresh = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = refreshTokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(_tokenOptions.RefreshTokenDays),
            CreatedAt = DateTime.UtcNow,
            ReplacedByTokenHash = null
        };
        _dbContext.RefreshTokens.Add(newRefresh);

        if (replacedToken != null)
        {
            replacedToken.RevokedAt = DateTime.UtcNow;
            replacedToken.ReplacedByTokenHash = refreshTokenHash;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiresAt = expiresAt,
            TokenType = "Bearer",
            UserId = user.Id,
            Email = user.Email,
            Roles = roles
        };
    }

    private async Task<Role> EnsureRoleAsync(string roleName, CancellationToken cancellationToken)
    {
        var role = await _dbContext.Roles.FirstOrDefaultAsync(r => r.Name == roleName, cancellationToken);
        if (role == null)
        {
            role = new Role { Id = Guid.NewGuid(), Name = roleName };
            _dbContext.Roles.Add(role);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        return role;
    }

    private static string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }
}
