using CryptoMarket.Application.DTOs.Portfolio;
using CryptoMarket.Application.Interfaces.Repositories;
using CryptoMarket.Application.Interfaces.Services;
using CryptoMarket.Application.Services;
using CryptoMarket.Domain.Entities;
using CryptoMarket.Domain.Enums;
using Microsoft.Extensions.Logging;
using Moq;

namespace CryptoMarket.Tests.Unit.Services;

public class PortfolioServiceTests
{
    private readonly Mock<IPortfolioRepository> _portfolioRepositoryMock;
    private readonly Mock<ICryptoHoldingRepository> _cryptoHoldingRepositoryMock;
    private readonly Mock<ITransactionRepository> _transactionRepositoryMock;
    private readonly Mock<ICryptoService> _cryptoServiceMock;
    private readonly Mock<ILogger<PortfolioService>> _loggerMock;
    private readonly PortfolioService _portfolioService;

    public PortfolioServiceTests()
    {
        _portfolioRepositoryMock = new Mock<IPortfolioRepository>();
        _cryptoHoldingRepositoryMock = new Mock<ICryptoHoldingRepository>();
        _transactionRepositoryMock = new Mock<ITransactionRepository>();
        _cryptoServiceMock = new Mock<ICryptoService>();
        _loggerMock = new Mock<ILogger<PortfolioService>>();

        _portfolioService = new PortfolioService(
            _portfolioRepositoryMock.Object,
            _cryptoHoldingRepositoryMock.Object,
            _transactionRepositoryMock.Object,
            _cryptoServiceMock.Object,
            _loggerMock.Object
        );
    }

    [Fact]
    public async Task GetPortfolioAsync_ValidUser_ReturnsPortfolioDto()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var portfolio = new Portfolio
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CryptoHoldings = new List<CryptoHolding>
            {
                new CryptoHolding
                {
                    Id = Guid.NewGuid(),
                    CryptoId = "bitcoin",
                    Symbol = "BTC",
                    Name = "Bitcoin",
                    Amount = 0.5m,
                    AverageBuyPrice = 50000m,
                    CurrentPrice = 52000m
                }
            }
        };

        _portfolioRepositoryMock.Setup(x => x.GetByUserIdWithHoldingsAsync(userId))
            .ReturnsAsync(portfolio);

        // Act
        var result = await _portfolioService.GetPortfolioAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(portfolio.Id, result.Id);
        Assert.Equal(userId, result.UserId);
        Assert.Single(result.Holdings);
        Assert.Equal(26000m, result.TotalValue); // 0.5 * 52000
        Assert.Equal(25000m, result.TotalInvested); // 0.5 * 50000
        Assert.Equal(1000m, result.TotalProfitLoss); // 26000 - 25000
        Assert.Equal(4m, result.TotalProfitLossPercentage); // (1000 / 25000) * 100
    }

    [Fact]
    public async Task GetPerformanceAsync_CalculatesCorrectly()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var portfolio = new Portfolio
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CryptoHoldings = new List<CryptoHolding>
            {
                new CryptoHolding
                {
                    Id = Guid.NewGuid(),
                    CryptoId = "bitcoin",
                    Symbol = "BTC",
                    Name = "Bitcoin",
                    Amount = 0.5m,
                    AverageBuyPrice = 50000m,
                    CurrentPrice = 55000m // +10% gain
                },
                new CryptoHolding
                {
                    Id = Guid.NewGuid(),
                    CryptoId = "ethereum",
                    Symbol = "ETH",
                    Name = "Ethereum",
                    Amount = 2.0m,
                    AverageBuyPrice = 3000m,
                    CurrentPrice = 2700m // -10% loss
                }
            }
        };

        _portfolioRepositoryMock.Setup(x => x.GetByUserIdWithHoldingsAsync(userId))
            .ReturnsAsync(portfolio);

        _transactionRepositoryMock.Setup(x => x.GetCountByUserIdAsync(userId))
            .ReturnsAsync(3);

        // Act
        var result = await _portfolioService.GetPerformanceAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(33000m, result.TotalValue); // (0.5 * 55000) + (2.0 * 2700)
        Assert.Equal(31000m, result.TotalInvested); // (0.5 * 50000) + (2.0 * 3000)
        Assert.Equal(2000m, result.TotalProfitLoss);
        Assert.Equal(2, result.TotalHoldings);
        Assert.Equal(3, result.TotalTransactions);

        // Best performer should be Bitcoin (+10%)
        Assert.NotNull(result.BestPerformer);
        Assert.Equal("bitcoin", result.BestPerformer.CryptoId);

        // Worst performer should be Ethereum (-10%)
        Assert.NotNull(result.WorstPerformer);
        Assert.Equal("ethereum", result.WorstPerformer.CryptoId);

        // Allocations
        Assert.Equal(2, result.Allocations.Count);
        Assert.Contains(result.Allocations, a => a.CryptoId == "bitcoin");
        Assert.Contains(result.Allocations, a => a.CryptoId == "ethereum");
    }

    [Fact]
    public async Task AddPurchaseAsync_NewCrypto_CreatesNewHolding()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var cryptoId = "bitcoin";
        var amount = 0.5m;
        var price = 50000m;

        var portfolio = new Portfolio
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CryptoHoldings = new List<CryptoHolding>()
        };

        _portfolioRepositoryMock.Setup(x => x.GetByUserIdWithHoldingsAsync(userId))
            .ReturnsAsync(portfolio);

        _cryptoServiceMock.Setup(x => x.GetCryptoDetailAsync(cryptoId))
            .ReturnsAsync(new Application.DTOs.Crypto.CryptoDetail
            {
                Id = cryptoId,
                Symbol = "btc",
                Name = "Bitcoin",
                CurrentPrice = price
            });

        // Act
        await _portfolioService.AddPurchaseAsync(userId, cryptoId, amount, price);

        // Assert
        _cryptoHoldingRepositoryMock.Verify(x => x.AddAsync(It.Is<CryptoHolding>(
            h => h.CryptoId == cryptoId && h.Amount == amount && h.AverageBuyPrice == price
        )), Times.Once);

        _transactionRepositoryMock.Verify(x => x.AddAsync(It.Is<Transaction>(
            t => t.Type == TransactionType.Buy && t.Amount == amount && t.PriceAtTransaction == price
        )), Times.Once);
    }

    [Fact]
    public async Task AddPurchaseAsync_ExistingCrypto_UpdatesAverageBuyPrice()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var cryptoId = "bitcoin";
        var existingHoldingId = Guid.NewGuid();

        var portfolio = new Portfolio
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CryptoHoldings = new List<CryptoHolding>
            {
                new CryptoHolding
                {
                    Id = existingHoldingId,
                    CryptoId = cryptoId,
                    Symbol = "BTC",
                    Name = "Bitcoin",
                    Amount = 0.5m,
                    AverageBuyPrice = 50000m,
                    CurrentPrice = 52000m
                }
            }
        };

        _portfolioRepositoryMock.Setup(x => x.GetByUserIdWithHoldingsAsync(userId))
            .ReturnsAsync(portfolio);

        _cryptoServiceMock.Setup(x => x.GetCryptoDetailAsync(cryptoId))
            .ReturnsAsync(new Application.DTOs.Crypto.CryptoDetail
            {
                Id = cryptoId,
                Symbol = "btc",
                Name = "Bitcoin",
                CurrentPrice = 54000m
            });

        // Act
        await _portfolioService.AddPurchaseAsync(userId, cryptoId, 0.3m, 54000m);

        // Assert
        // New average = (0.5 * 50000 + 0.3 * 54000) / (0.5 + 0.3)
        // = (25000 + 16200) / 0.8 = 41200 / 0.8 = 51500
        _cryptoHoldingRepositoryMock.Verify(x => x.UpdateAsync(It.Is<CryptoHolding>(
            h => h.Id == existingHoldingId &&
                 h.Amount == 0.8m &&
                 h.AverageBuyPrice == 51500m
        )), Times.Once);

        _transactionRepositoryMock.Verify(x => x.AddAsync(It.Is<Transaction>(
            t => t.Type == TransactionType.Buy &&
                 t.Amount == 0.3m &&
                 t.PriceAtTransaction == 54000m
        )), Times.Once);
    }

    [Fact]
    public async Task GetTransactionsAsync_ReturnsPaginatedResults()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var transactions = new List<Transaction>
        {
            new Transaction
            {
                Id = Guid.NewGuid(),
                CryptoId = "bitcoin",
                Symbol = "BTC",
                Name = "Bitcoin",
                Type = TransactionType.Buy,
                Amount = 0.5m,
                PriceAtTransaction = 50000m,
                TransactionDate = DateTime.UtcNow
            }
        };

        _transactionRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, 1, 20))
            .ReturnsAsync(transactions);

        // Act
        var result = await _portfolioService.GetTransactionsAsync(userId, 1, 20);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        Assert.Equal("bitcoin", result[0].CryptoId);
        Assert.Equal(TransactionType.Buy, result[0].Type);
        Assert.Equal(0.5m, result[0].Amount);
        Assert.Equal(50000m, result[0].PriceAtTransaction);
    }

    [Fact]
    public async Task GetHoldingAsync_ValidCrypto_ReturnsHoldingDto()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var cryptoId = "bitcoin";

        var portfolio = new Portfolio
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CryptoHoldings = new List<CryptoHolding>
            {
                new CryptoHolding
                {
                    Id = Guid.NewGuid(),
                    CryptoId = cryptoId,
                    Symbol = "BTC",
                    Name = "Bitcoin",
                    Amount = 0.5m,
                    AverageBuyPrice = 50000m,
                    CurrentPrice = 52000m
                }
            }
        };

        _portfolioRepositoryMock.Setup(x => x.GetByUserIdWithHoldingsAsync(userId))
            .ReturnsAsync(portfolio);

        // Act
        var result = await _portfolioService.GetHoldingAsync(userId, cryptoId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(cryptoId, result.CryptoId);
        Assert.Equal(0.5m, result.Amount);
        Assert.Equal(50000m, result.AverageBuyPrice);
        Assert.Equal(52000m, result.CurrentPrice);
        Assert.Equal(26000m, result.CurrentValue);
        Assert.Equal(25000m, result.TotalInvested);
        Assert.Equal(1000m, result.ProfitLoss);
    }
}
