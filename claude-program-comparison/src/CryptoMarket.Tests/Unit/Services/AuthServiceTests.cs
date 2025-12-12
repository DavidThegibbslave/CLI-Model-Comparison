using CryptoMarket.Application.DTOs.Auth;
using CryptoMarket.Application.Interfaces.Repositories;
using CryptoMarket.Application.Interfaces.Services;
using CryptoMarket.Application.Services;
using CryptoMarket.Domain.Entities;
using CryptoMarket.Domain.Enums;
using Microsoft.Extensions.Logging;
using Moq;

namespace CryptoMarket.Tests.Unit.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IRefreshTokenRepository> _refreshTokenRepositoryMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly Mock<ILogger<AuthService>> _loggerMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _refreshTokenRepositoryMock = new Mock<IRefreshTokenRepository>();
        _tokenServiceMock = new Mock<ITokenService>();
        _loggerMock = new Mock<ILogger<AuthService>>();

        _authService = new AuthService(
            _userRepositoryMock.Object,
            _refreshTokenRepositoryMock.Object,
            _tokenServiceMock.Object,
            _loggerMock.Object
        );
    }

    [Fact]
    public async Task RegisterAsync_ValidInput_ReturnsAuthResponse()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "test@example.com",
            Password = "SecurePass123!",
            FirstName = "John",
            LastName = "Doe"
        };

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync((User?)null);

        _userRepositoryMock.Setup(x => x.AddAsync(It.IsAny<User>()))
            .Returns(Task.CompletedTask);

        _tokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<User>()))
            .Returns("access_token");

        _tokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns("refresh_token");

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("access_token", result.AccessToken);
        Assert.Equal("refresh_token", result.RefreshToken);
        Assert.Equal(request.Email, result.User.Email);
        Assert.Equal(request.FirstName, result.User.FirstName);
        Assert.Equal(request.LastName, result.User.LastName);
        Assert.Equal(UserRole.User, result.User.Role);

        _userRepositoryMock.Verify(x => x.AddAsync(It.IsAny<User>()), Times.Once);
        _refreshTokenRepositoryMock.Verify(x => x.AddAsync(It.IsAny<RefreshToken>()), Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_EmailAlreadyExists_ThrowsInvalidOperationException()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "existing@example.com",
            Password = "SecurePass123!",
            FirstName = "John",
            LastName = "Doe"
        };

        var existingUser = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email
        };

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(request.Email))
            .ReturnsAsync(existingUser);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _authService.RegisterAsync(request)
        );

        _userRepositoryMock.Verify(x => x.AddAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsAuthResponse()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "test@example.com",
            Password = "SecurePass123!"
        };

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = hashedPassword,
            FirstName = "John",
            LastName = "Doe",
            Role = UserRole.User
        };

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(request.Email))
            .ReturnsAsync(user);

        _tokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<User>()))
            .Returns("access_token");

        _tokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns("refresh_token");

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("access_token", result.AccessToken);
        Assert.Equal("refresh_token", result.RefreshToken);
        Assert.Equal(user.Email, result.User.Email);

        _refreshTokenRepositoryMock.Verify(x => x.AddAsync(It.IsAny<RefreshToken>()), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_InvalidEmail_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "nonexistent@example.com",
            Password = "SecurePass123!"
        };

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(request.Email))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _authService.LoginAsync(request)
        );
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "test@example.com",
            Password = "WrongPassword123!"
        };

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword("CorrectPassword123!");
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = hashedPassword
        };

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(request.Email))
            .ReturnsAsync(user);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _authService.LoginAsync(request)
        );
    }

    [Fact]
    public async Task RefreshTokenAsync_ValidToken_ReturnsNewTokens()
    {
        // Arrange
        var refreshTokenValue = "valid_refresh_token";
        var userId = Guid.NewGuid();

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = refreshTokenValue,
            UserId = userId,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };

        var user = new User
        {
            Id = userId,
            Email = "test@example.com",
            FirstName = "John",
            LastName = "Doe",
            Role = UserRole.User
        };

        _refreshTokenRepositoryMock.Setup(x => x.GetByTokenAsync(refreshTokenValue))
            .ReturnsAsync(refreshToken);

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);

        _tokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<User>()))
            .Returns("new_access_token");

        _tokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns("new_refresh_token");

        // Act
        var result = await _authService.RefreshTokenAsync(refreshTokenValue);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("new_access_token", result.AccessToken);
        Assert.Equal("new_refresh_token", result.RefreshToken);

        _refreshTokenRepositoryMock.Verify(x => x.RevokeAsync(refreshToken.Id), Times.Once);
        _refreshTokenRepositoryMock.Verify(x => x.AddAsync(It.IsAny<RefreshToken>()), Times.Once);
    }

    [Fact]
    public async Task RefreshTokenAsync_ExpiredToken_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var refreshTokenValue = "expired_refresh_token";

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = refreshTokenValue,
            UserId = Guid.NewGuid(),
            ExpiresAt = DateTime.UtcNow.AddDays(-1), // Expired
            IsRevoked = false
        };

        _refreshTokenRepositoryMock.Setup(x => x.GetByTokenAsync(refreshTokenValue))
            .ReturnsAsync(refreshToken);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _authService.RefreshTokenAsync(refreshTokenValue)
        );
    }

    [Fact]
    public async Task RefreshTokenAsync_RevokedToken_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var refreshTokenValue = "revoked_refresh_token";

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = refreshTokenValue,
            UserId = Guid.NewGuid(),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = true // Revoked
        };

        _refreshTokenRepositoryMock.Setup(x => x.GetByTokenAsync(refreshTokenValue))
            .ReturnsAsync(refreshToken);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _authService.RefreshTokenAsync(refreshTokenValue)
        );
    }

    [Fact]
    public async Task LogoutAsync_ValidToken_RevokesToken()
    {
        // Arrange
        var refreshTokenValue = "valid_refresh_token";

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = refreshTokenValue,
            UserId = Guid.NewGuid(),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };

        _refreshTokenRepositoryMock.Setup(x => x.GetByTokenAsync(refreshTokenValue))
            .ReturnsAsync(refreshToken);

        // Act
        await _authService.LogoutAsync(refreshTokenValue);

        // Assert
        _refreshTokenRepositoryMock.Verify(x => x.RevokeAsync(refreshToken.Id), Times.Once);
    }
}
