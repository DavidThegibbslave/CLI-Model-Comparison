using CryptoMarket.Domain.Entities;
using CryptoMarket.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CryptoMarket.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
    {
        try
        {
            // Ensure database is created
            await context.Database.EnsureCreatedAsync();

            // Check if data already exists
            if (await context.Users.AnyAsync())
            {
                logger.LogInformation("Database already seeded");
                return;
            }

            logger.LogInformation("Starting database seeding...");

            // Seed Demo User
            var demoUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "demo@cryptomarket.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo123!"),
                FirstName = "Demo",
                LastName = "User",
                Role = UserRole.User,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            context.Users.Add(demoUser);
            await context.SaveChangesAsync();
            logger.LogInformation("Demo user created: {Email}", demoUser.Email);

            // Seed Demo Portfolio for user
            var demoPortfolio = new Portfolio
            {
                Id = Guid.NewGuid(),
                UserId = demoUser.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Portfolios.Add(demoPortfolio);
            await context.SaveChangesAsync();
            logger.LogInformation("Demo portfolio created");

            // Seed Demo Cart for user
            var demoCart = new Cart
            {
                Id = Guid.NewGuid(),
                UserId = demoUser.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Carts.Add(demoCart);
            await context.SaveChangesAsync();
            logger.LogInformation("Demo cart created");

            // Seed Some Demo Holdings
            var holdings = new List<CryptoHolding>
            {
                new CryptoHolding
                {
                    Id = Guid.NewGuid(),
                    PortfolioId = demoPortfolio.Id,
                    CryptoId = "bitcoin",
                    Symbol = "BTC",
                    Name = "Bitcoin",
                    Amount = 0.5m,
                    AveragePurchasePrice =40000m,
                    FirstPurchaseDate = DateTime.UtcNow.AddDays(-30),
                    LastUpdated = DateTime.UtcNow
                },
                new CryptoHolding
                {
                    Id = Guid.NewGuid(),
                    PortfolioId = demoPortfolio.Id,
                    CryptoId = "ethereum",
                    Symbol = "ETH",
                    Name = "Ethereum",
                    Amount = 2.5m,
                    AveragePurchasePrice =2200m,
                    FirstPurchaseDate = DateTime.UtcNow.AddDays(-20),
                    LastUpdated = DateTime.UtcNow
                },
                new CryptoHolding
                {
                    Id = Guid.NewGuid(),
                    PortfolioId = demoPortfolio.Id,
                    CryptoId = "cardano",
                    Symbol = "ADA",
                    Name = "Cardano",
                    Amount = 1000m,
                    AveragePurchasePrice =0.55m,
                    FirstPurchaseDate = DateTime.UtcNow.AddDays(-10),
                    LastUpdated = DateTime.UtcNow
                }
            };

            context.CryptoHoldings.AddRange(holdings);
            await context.SaveChangesAsync();
            logger.LogInformation("Demo holdings created: {Count}", holdings.Count);

            // Seed Demo Transactions
            var transactions = new List<Transaction>
            {
                new Transaction
                {
                    Id = Guid.NewGuid(),
                    PortfolioId = demoPortfolio.Id,
                    CryptoId = "bitcoin",
                    Symbol = "BTC",
                    Type = TransactionType.Buy,
                    Amount = 0.25m,
                    PriceAtTransaction = 38000m,
                    TotalValue = 9500m,
                    Timestamp = DateTime.UtcNow.AddDays(-30)
                },
                new Transaction
                {
                    Id = Guid.NewGuid(),
                    PortfolioId = demoPortfolio.Id,
                    CryptoId = "bitcoin",
                    Symbol = "BTC",
                    Type = TransactionType.Buy,
                    Amount = 0.25m,
                    PriceAtTransaction = 42000m,
                    TotalValue = 10500m,
                    Timestamp = DateTime.UtcNow.AddDays(-25)
                },
                new Transaction
                {
                    Id = Guid.NewGuid(),
                    PortfolioId = demoPortfolio.Id,
                    CryptoId = "ethereum",
                    Symbol = "ETH",
                    Type = TransactionType.Buy,
                    Amount = 1.5m,
                    PriceAtTransaction = 2000m,
                    TotalValue = 3000m,
                    Timestamp = DateTime.UtcNow.AddDays(-20)
                },
                new Transaction
                {
                    Id = Guid.NewGuid(),
                    PortfolioId = demoPortfolio.Id,
                    CryptoId = "ethereum",
                    Symbol = "ETH",
                    Type = TransactionType.Buy,
                    Amount = 1.0m,
                    PriceAtTransaction = 2400m,
                    TotalValue = 2400m,
                    Timestamp = DateTime.UtcNow.AddDays(-15)
                },
                new Transaction
                {
                    Id = Guid.NewGuid(),
                    PortfolioId = demoPortfolio.Id,
                    CryptoId = "cardano",
                    Symbol = "ADA",
                    Type = TransactionType.Buy,
                    Amount = 1000m,
                    PriceAtTransaction = 0.55m,
                    TotalValue = 550m,
                    Timestamp = DateTime.UtcNow.AddDays(-10)
                }
            };

            context.Transactions.AddRange(transactions);
            await context.SaveChangesAsync();
            logger.LogInformation("Demo transactions created: {Count}", transactions.Count);

            // Seed Price Cache with popular cryptocurrencies
            var priceCache = new List<PriceCache>
            {
                new PriceCache
                {
                    CryptoId = "bitcoin",
                    Symbol = "BTC",
                    Name = "Bitcoin",
                    CurrentPrice = 45000m,
                    MarketCap = 880000000000m,
                    Volume24h = 28000000000m,
                    PriceChange24h = 1200m,
                    PriceChangePercentage24h = 2.74m,
                    LastUpdated = DateTime.UtcNow,
                    ImageUrl = "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
                },
                new PriceCache
                {
                    CryptoId = "ethereum",
                    Symbol = "ETH",
                    Name = "Ethereum",
                    CurrentPrice = 2450m,
                    MarketCap = 294000000000m,
                    Volume24h = 15000000000m,
                    PriceChange24h = 75m,
                    PriceChangePercentage24h = 3.15m,
                    LastUpdated = DateTime.UtcNow,
                    ImageUrl = "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
                },
                new PriceCache
                {
                    CryptoId = "tether",
                    Symbol = "USDT",
                    Name = "Tether",
                    CurrentPrice = 1.00m,
                    MarketCap = 95000000000m,
                    Volume24h = 45000000000m,
                    PriceChange24h = 0.001m,
                    PriceChangePercentage24h = 0.1m,
                    LastUpdated = DateTime.UtcNow,
                    ImageUrl = "https://assets.coingecko.com/coins/images/325/large/Tether.png"
                },
                new PriceCache
                {
                    CryptoId = "binancecoin",
                    Symbol = "BNB",
                    Name = "BNB",
                    CurrentPrice = 310m,
                    MarketCap = 47000000000m,
                    Volume24h = 1200000000m,
                    PriceChange24h = 8m,
                    PriceChangePercentage24h = 2.65m,
                    LastUpdated = DateTime.UtcNow,
                    ImageUrl = "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png"
                },
                new PriceCache
                {
                    CryptoId = "solana",
                    Symbol = "SOL",
                    Name = "Solana",
                    CurrentPrice = 98m,
                    MarketCap = 42000000000m,
                    Volume24h = 2100000000m,
                    PriceChange24h = 5.2m,
                    PriceChangePercentage24h = 5.6m,
                    LastUpdated = DateTime.UtcNow,
                    ImageUrl = "https://assets.coingecko.com/coins/images/4128/large/solana.png"
                },
                new PriceCache
                {
                    CryptoId = "ripple",
                    Symbol = "XRP",
                    Name = "XRP",
                    CurrentPrice = 0.52m,
                    MarketCap = 28000000000m,
                    Volume24h = 1500000000m,
                    PriceChange24h = 0.02m,
                    PriceChangePercentage24h = 4.0m,
                    LastUpdated = DateTime.UtcNow,
                    ImageUrl = "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png"
                },
                new PriceCache
                {
                    CryptoId = "cardano",
                    Symbol = "ADA",
                    Name = "Cardano",
                    CurrentPrice = 0.48m,
                    MarketCap = 17000000000m,
                    Volume24h = 450000000m,
                    PriceChange24h = -0.03m,
                    PriceChangePercentage24h = -5.88m,
                    LastUpdated = DateTime.UtcNow,
                    ImageUrl = "https://assets.coingecko.com/coins/images/975/large/cardano.png"
                },
                new PriceCache
                {
                    CryptoId = "dogecoin",
                    Symbol = "DOGE",
                    Name = "Dogecoin",
                    CurrentPrice = 0.08m,
                    MarketCap = 11500000000m,
                    Volume24h = 650000000m,
                    PriceChange24h = 0.003m,
                    PriceChangePercentage24h = 3.9m,
                    LastUpdated = DateTime.UtcNow,
                    ImageUrl = "https://assets.coingecko.com/coins/images/5/large/dogecoin.png"
                },
                new PriceCache
                {
                    CryptoId = "tron",
                    Symbol = "TRX",
                    Name = "TRON",
                    CurrentPrice = 0.11m,
                    MarketCap = 9800000000m,
                    Volume24h = 320000000m,
                    PriceChange24h = 0.004m,
                    PriceChangePercentage24h = 3.77m,
                    LastUpdated = DateTime.UtcNow,
                    ImageUrl = "https://assets.coingecko.com/coins/images/1094/large/tron-logo.png"
                },
                new PriceCache
                {
                    CryptoId = "polkadot",
                    Symbol = "DOT",
                    Name = "Polkadot",
                    CurrentPrice = 7.2m,
                    MarketCap = 9200000000m,
                    Volume24h = 280000000m,
                    PriceChange24h = 0.35m,
                    PriceChangePercentage24h = 5.11m,
                    LastUpdated = DateTime.UtcNow,
                    ImageUrl = "https://assets.coingecko.com/coins/images/12171/large/polkadot.png"
                }
            };

            context.PriceCaches.AddRange(priceCache);
            await context.SaveChangesAsync();
            logger.LogInformation("Price cache seeded with {Count} cryptocurrencies", priceCache.Count);

            logger.LogInformation("Database seeding completed successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database");
            throw;
        }
    }
}
