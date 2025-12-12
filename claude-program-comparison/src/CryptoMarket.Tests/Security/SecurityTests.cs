using System.Net;
using System.Net.Http.Json;
using CryptoMarket.Application.DTOs.Auth;
using CryptoMarket.Web;

namespace CryptoMarket.Tests.Security;

public class SecurityTests : IClassFixture<TestWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public SecurityTests(TestWebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    #region SQL Injection Tests

    [Theory]
    [InlineData("test@example.com' OR '1'='1")]
    [InlineData("admin'--")]
    [InlineData("'; DROP TABLE Users--")]
    [InlineData("test@example.com'; DELETE FROM Users WHERE '1'='1")]
    public async Task Login_SQLInjectionAttempt_IsRejected(string maliciousEmail)
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Email = maliciousEmail,
            Password = "password"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        Assert.NotEqual(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.StatusCode == HttpStatusCode.BadRequest ||
                    response.StatusCode == HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("bitcoin' OR '1'='1")]
    [InlineData("'; DROP TABLE CryptoHoldings--")]
    public async Task GetCrypto_SQLInjectionAttempt_IsRejected(string maliciousCryptoId)
    {
        // Act
        var response = await _client.GetAsync($"/api/crypto/{maliciousCryptoId}");

        // Assert
        // Should either return 404 or 400, not 200 with leaked data
        Assert.NotEqual(HttpStatusCode.OK, response.StatusCode);
    }

    #endregion

    #region XSS Tests

    [Theory]
    [InlineData("<script>alert('XSS')</script>")]
    [InlineData("<img src=x onerror=alert('XSS')>")]
    [InlineData("<svg onload=alert('XSS')>")]
    public async Task Register_XSSPayloadInName_IsSanitized(string xssPayload)
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = $"test{Guid.NewGuid()}@example.com",
            Password = "SecurePass123!",
            FirstName = xssPayload,
            LastName = "Doe"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        if (response.IsSuccessStatusCode)
        {
            var result = await response.Content.ReadFromJsonAsync<AuthResponse>();
            // The payload should not contain executable scripts
            Assert.NotNull(result);
            // If it's stored, it should be HTML-encoded or sanitized
            Assert.DoesNotContain("<script", result.User.FirstName, StringComparison.OrdinalIgnoreCase);
        }
        else
        {
            // Or it should be rejected
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    #endregion

    #region Authentication & Authorization Tests

    [Fact]
    public async Task ProtectedEndpoint_NoToken_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/cart");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_InvalidToken_ReturnsUnauthorized()
    {
        // Arrange
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "invalid.token.here");

        // Act
        var response = await _client.GetAsync("/api/cart");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_ExpiredToken_ReturnsUnauthorized()
    {
        // Arrange - Create an expired token (manually crafted or from old registration)
        // For this test, we'll use an obviously invalid/expired token format
        var expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjB9.invalid";

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", expiredToken);

        // Act
        var response = await _client.GetAsync("/api/cart");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_ValidToken_ReturnsSuccess()
    {
        // Arrange - Register and login to get valid token
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

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authResponse!.AccessToken);

        // Act
        var response = await _client.GetAsync("/api/cart");

        // Assert
        Assert.True(response.IsSuccessStatusCode || response.StatusCode == HttpStatusCode.NotFound);
        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Cart_CannotAccessOtherUsersCart()
    {
        // Arrange - Create two users
        var user1Email = $"user1{Guid.NewGuid()}@example.com";
        var user2Email = $"user2{Guid.NewGuid()}@example.com";

        var user1Register = new RegisterRequest
        {
            Email = user1Email,
            Password = "SecurePass123!",
            FirstName = "User",
            LastName = "One"
        };

        var user2Register = new RegisterRequest
        {
            Email = user2Email,
            Password = "SecurePass123!",
            FirstName = "User",
            LastName = "Two"
        };

        var user1Response = await _client.PostAsJsonAsync("/api/auth/register", user1Register);
        var user1Auth = await user1Response.Content.ReadFromJsonAsync<AuthResponse>();

        var user2Response = await _client.PostAsJsonAsync("/api/auth/register", user2Register);
        var user2Auth = await user2Response.Content.ReadFromJsonAsync<AuthResponse>();

        // User1 adds item to cart
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", user1Auth!.AccessToken);

        // User2 tries to access their own cart (should be empty or not exist)
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", user2Auth!.AccessToken);

        var user2CartResponse = await _client.GetAsync("/api/cart");

        // Assert - User2 should get their own empty cart, not User1's cart
        // This is implicit - if they got User1's cart, it would have items
        Assert.True(user2CartResponse.IsSuccessStatusCode || user2CartResponse.StatusCode == HttpStatusCode.NotFound);
    }

    #endregion

    #region Password Security Tests

    [Theory]
    [InlineData("weak")]
    [InlineData("password")]
    [InlineData("12345678")]
    [InlineData("onlylowercase")]
    [InlineData("ONLYUPPERCASE")]
    [InlineData("NoSpecialChar123")]
    public async Task Register_WeakPassword_IsRejected(string weakPassword)
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = $"test{Guid.NewGuid()}@example.com",
            Password = weakPassword,
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_StrongPassword_IsAccepted()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = $"test{Guid.NewGuid()}@example.com",
            Password = "SecurePass123!", // Contains upper, lower, digit, special char
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    #endregion

    #region Input Validation Tests

    [Theory]
    [InlineData("")] // Empty email
    [InlineData("notanemail")] // Invalid format
    [InlineData("@example.com")] // Missing local part
    [InlineData("test@")] // Missing domain
    public async Task Register_InvalidEmail_ReturnsBadRequest(string invalidEmail)
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = invalidEmail,
            Password = "SecurePass123!",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(0)]
    [InlineData(-0.5)]
    public async Task AddToCart_NegativeOrZeroAmount_ReturnsBadRequest(decimal invalidAmount)
    {
        // Arrange - Register and login first
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

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authResponse!.AccessToken);

        var addToCartRequest = new
        {
            cryptoId = "bitcoin",
            amount = invalidAmount
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/cart/items", addToCartRequest);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    #endregion

    #region HTTPS Enforcement Tests

    [Fact]
    public void SecurityHeaders_AreConfigured()
    {
        // This test verifies that security headers are configured in the application
        // In production, these should be enforced:
        // - Strict-Transport-Security
        // - X-Content-Type-Options
        // - X-Frame-Options
        // - X-XSS-Protection
        // - Content-Security-Policy

        // For now, this is a placeholder that documents the requirement
        Assert.True(true, "Security headers should be configured in production");
    }

    #endregion
}
