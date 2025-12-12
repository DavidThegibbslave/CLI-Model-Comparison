using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using CryptoMarket.Infrastructure.Persistence;
using CryptoMarket.Application.DTOs.Auth;
using System.Net.Http.Json;
using FluentAssertions;
using System.Net;

namespace CryptoMarket.Tests.IntegrationTests;

public class AuthIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AuthIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Replace PostgreSQL with InMemory DB for testing
                services.RemoveAll(typeof(DbContextOptions<AppDbContext>));
                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseInMemoryDatabase("InMemoryDbForTesting");
                });
            });
        });

        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task Register_ShouldReturnToken_WhenValid()
    {
        // Arrange
        var request = new RegisterRequest 
        { 
            Username = "TestUser", 
            Email = $"test_{Guid.NewGuid()}@example.com", 
            Password = "Password123!" 
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        authResponse.Should().NotBeNull();
        authResponse!.AccessToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_ShouldReturnToken_WhenCredentialsValid()
    {
        // Arrange: Register first
        var email = $"login_{Guid.NewGuid()}@example.com";
        await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest 
        { 
            Username = "LoginUser", 
            Email = email, 
            Password = "Password123!" 
        });

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest 
        { 
            Email = email, 
            Password = "Password123!" 
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        authResponse.Should().NotBeNull();
    }

    [Fact]
    public async Task ProtectedEndpoint_ShouldReturn401_WhenNoToken()
    {
        // Act
        var response = await _client.GetAsync("/api/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
