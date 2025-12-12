using System.Net;
using System.Net.Http.Json;
using CryptoMarket.Application.DTOs.Auth;
using CryptoMarket.Web;

namespace CryptoMarket.Tests.Integration.Controllers;

public class AuthControllerTests : IClassFixture<TestWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthControllerTests(TestWebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_ValidRequest_ReturnsCreated()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = $"test{Guid.NewGuid()}@example.com",
            Password = "SecurePass123!",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(result);
        Assert.NotNull(result.AccessToken);
        Assert.NotNull(result.RefreshToken);
        Assert.Equal(request.Email, result.User.Email);
    }

    [Fact]
    public async Task Register_DuplicateEmail_ReturnsConflict()
    {
        // Arrange
        var email = $"duplicate{Guid.NewGuid()}@example.com";
        var request = new RegisterRequest
        {
            Email = email,
            Password = "SecurePass123!",
            FirstName = "John",
            LastName = "Doe"
        };

        // Register first time
        await _client.PostAsJsonAsync("/api/auth/register", request);

        // Act - Register second time with same email
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Register_InvalidPassword_ReturnsBadRequest()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = $"test{Guid.NewGuid()}@example.com",
            Password = "weak", // Too weak
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOk()
    {
        // Arrange - Register user first
        var email = $"test{Guid.NewGuid()}@example.com";
        var password = "SecurePass123!";
        var registerRequest = new RegisterRequest
        {
            Email = email,
            Password = password,
            FirstName = "John",
            LastName = "Doe"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = email,
            Password = password
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(result);
        Assert.NotNull(result.AccessToken);
        Assert.NotNull(result.RefreshToken);
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Email = "nonexistent@example.com",
            Password = "WrongPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RefreshToken_ValidToken_ReturnsOk()
    {
        // Arrange - Register and get tokens
        var email = $"test{Guid.NewGuid()}@example.com";
        var registerRequest = new RegisterRequest
        {
            Email = email,
            Password = "SecurePass123!",
            FirstName = "John",
            LastName = "Doe"
        };
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        var authResponse = await registerResponse.Content.ReadFromJsonAsync<AuthResponse>();

        var refreshRequest = new RefreshTokenRequest
        {
            RefreshToken = authResponse!.RefreshToken
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/refresh", refreshRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(result);
        Assert.NotNull(result.AccessToken);
        Assert.NotNull(result.RefreshToken);
        Assert.NotEqual(authResponse.RefreshToken, result.RefreshToken); // New token
    }

    [Fact]
    public async Task RefreshToken_InvalidToken_ReturnsUnauthorized()
    {
        // Arrange
        var refreshRequest = new RefreshTokenRequest
        {
            RefreshToken = "invalid-token-12345"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/refresh", refreshRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetMe_AuthenticatedUser_ReturnsOk()
    {
        // Arrange - Register and login
        var email = $"test{Guid.NewGuid()}@example.com";
        var registerRequest = new RegisterRequest
        {
            Email = email,
            Password = "SecurePass123!",
            FirstName = "John",
            LastName = "Doe"
        };
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        var authResponse = await registerResponse.Content.ReadFromJsonAsync<AuthResponse>();

        // Add auth header
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authResponse!.AccessToken);

        // Act
        var response = await _client.GetAsync("/api/auth/me");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<UserDto>();
        Assert.NotNull(result);
        Assert.Equal(email, result.Email);
    }

    [Fact]
    public async Task GetMe_Unauthenticated_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/auth/me");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_ValidToken_ReturnsNoContent()
    {
        // Arrange - Register and get tokens
        var email = $"test{Guid.NewGuid()}@example.com";
        var registerRequest = new RegisterRequest
        {
            Email = email,
            Password = "SecurePass123!",
            FirstName = "John",
            LastName = "Doe"
        };
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        var authResponse = await registerResponse.Content.ReadFromJsonAsync<AuthResponse>();

        // Add auth header
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authResponse!.AccessToken);

        var logoutRequest = new LogoutRequest
        {
            RefreshToken = authResponse.RefreshToken
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/logout", logoutRequest);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Verify token is revoked - try to refresh with it
        var refreshResponse = await _client.PostAsJsonAsync("/api/auth/refresh", new RefreshTokenRequest
        {
            RefreshToken = authResponse.RefreshToken
        });
        Assert.Equal(HttpStatusCode.Unauthorized, refreshResponse.StatusCode);
    }
}
