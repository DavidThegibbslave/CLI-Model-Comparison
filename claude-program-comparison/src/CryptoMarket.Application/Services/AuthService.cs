using BCrypt.Net;
using CryptoMarket.Application.DTOs.Auth;
using CryptoMarket.Application.Interfaces.Repositories;
using CryptoMarket.Application.Interfaces.Services;
using CryptoMarket.Domain.Entities;
using CryptoMarket.Domain.Enums;

namespace CryptoMarket.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ITokenService _tokenService;

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        ITokenService tokenService)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _tokenService = tokenService;
    }

    public async Task<TokenDto> RegisterAsync(RegisterDto registerDto)
    {
        // Check if email already exists
        if (await _userRepository.EmailExistsAsync(registerDto.Email))
        {
            throw new InvalidOperationException("Email already exists");
        }

        // Create user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = registerDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            Role = UserRole.User,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        // Create associated portfolio and cart
        user.Portfolio = new Portfolio
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow
        };

        user.Cart = new Cart
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.CreateAsync(user);

        // Generate tokens
        return await GenerateTokensAsync(user);
    }

    public async Task<TokenDto> LoginAsync(LoginDto loginDto)
    {
        var user = await _userRepository.GetByEmailAsync(loginDto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Account is inactive");
        }

        await _userRepository.UpdateAsync(user);

        return await GenerateTokensAsync(user);
    }

    public async Task<TokenDto> RefreshTokenAsync(string refreshToken)
    {
        var token = await _tokenService.ValidateRefreshTokenAsync(refreshToken);

        if (token == null)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token");
        }

        var user = await _userRepository.GetByIdAsync(token.UserId);

        if (user == null || !user.IsActive)
        {
            throw new UnauthorizedAccessException("User not found or inactive");
        }

        // Revoke old token
        token.RevokedAt = DateTime.UtcNow;
        await _refreshTokenRepository.UpdateAsync(token);

        // Generate new tokens
        return await GenerateTokensAsync(user);
    }

    public async Task RevokeTokenAsync(string refreshToken)
    {
        var token = await _refreshTokenRepository.GetByTokenAsync(refreshToken);

        if (token != null && token.IsActive)
        {
            token.RevokedAt = DateTime.UtcNow;
            await _refreshTokenRepository.UpdateAsync(token);
        }
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role.ToString()
        };
    }

    private async Task<TokenDto> GenerateTokensAsync(User user)
    {
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = await _tokenService.GenerateRefreshTokenAsync(user.Id);

        return new TokenDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            TokenType = "Bearer",
            ExpiresIn = 900, // 15 minutes in seconds
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role.ToString()
            }
        };
    }
}
