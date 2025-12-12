using CryptoMarket.Application.DTOs.Portfolio;
using CryptoMarket.Application.Interfaces;
using CryptoMarket.Domain.Entities;
using CryptoMarket.Infrastructure.Persistence;
using CryptoMarket.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using FluentAssertions;
using CryptoMarket.Application.DTOs.Market;

namespace CryptoMarket.Tests.UnitTests;

public class PortfolioServiceTests
{
    private readonly AppDbContext _context;
    private readonly Mock<ICryptoService> _mockCryptoService;
    private readonly PortfolioService _service;

    public PortfolioServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB per test
            .Options;

        _context = new AppDbContext(options);
        _mockCryptoService = new Mock<ICryptoService>();
        _service = new PortfolioService(_context, _mockCryptoService.Object);
    }

    [Fact]
    public async Task CreatePortfolioAsync_ShouldCreatePortfolio_WithDefaultBalance()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var request = new CreatePortfolioRequest { Name = "My Fund" };

        // Act
        var result = await _service.CreatePortfolioAsync(userId, request);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("My Fund");
        result.BalanceUsd.Should().Be(10000m);
        
        var dbPortfolio = await _context.Portfolios.FindAsync(result.Id);
        dbPortfolio.Should().NotBeNull();
    }

    [Fact]
    public async Task ExecuteOrderAsync_Buy_ShouldDeductBalanceAndAddPosition()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var portfolio = new Portfolio { Id = Guid.NewGuid(), UserId = userId, BalanceUsd = 10000m };
        _context.Portfolios.Add(portfolio);
        await _context.SaveChangesAsync();

        _mockCryptoService.Setup(s => s.GetAssetAsync("bitcoin"))
            .ReturnsAsync(new CoinGeckoPriceResponse { Id = "bitcoin", CurrentPrice = 50000m });
        
        _mockCryptoService.Setup(s => s.GetTopAssetsAsync(It.IsAny<int>()))
            .ReturnsAsync(new List<CoinGeckoPriceResponse> { new CoinGeckoPriceResponse { Id = "bitcoin", CurrentPrice = 50000m } });

        var order = new OrderRequest { AssetId = "bitcoin", Quantity = 0.1m }; // Cost: 5000

        // Act
        var result = await _service.ExecuteOrderAsync(userId, portfolio.Id, order, "Buy");

        // Assert
        result.BalanceUsd.Should().Be(5000m);
        result.Positions.Should().ContainSingle(p => p.AssetId == "bitcoin" && p.Quantity == 0.1m);
    }

    [Fact]
    public async Task ExecuteOrderAsync_Buy_InsufficientFunds_ShouldThrow()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var portfolio = new Portfolio { Id = Guid.NewGuid(), UserId = userId, BalanceUsd = 100m };
        _context.Portfolios.Add(portfolio);
        await _context.SaveChangesAsync();

        _mockCryptoService.Setup(s => s.GetAssetAsync("bitcoin"))
            .ReturnsAsync(new CoinGeckoPriceResponse { Id = "bitcoin", CurrentPrice = 50000m });

        var order = new OrderRequest { AssetId = "bitcoin", Quantity = 1m }; // Cost: 50000

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _service.ExecuteOrderAsync(userId, portfolio.Id, order, "Buy"));
    }
}
