using CryptoMarket.Application.DTOs.Crypto;
using CryptoMarket.Application.Interfaces.Services;

namespace CryptoMarket.Infrastructure.ExternalServices.Mock;

/// <summary>
/// Offline fallback crypto service that serves static mock data, avoiding any external HTTP calls.
/// </summary>
public class MockCryptoService : ICryptoService
{
    private readonly List<CryptoMarketDto> _markets;

    public MockCryptoService()
    {
        var now = DateTime.UtcNow;
        _markets = new List<CryptoMarketDto>
        {
            new()
            {
                Id = "bitcoin",
                Symbol = "btc",
                Name = "Bitcoin",
                Image = "https://dummyimage.com/64x64/000/fff&text=BTC",
                CurrentPrice = 68000m,
                MarketCap = 1_300_000_000_000m,
                MarketCapRank = 1,
                Volume24h = 20_000_000_000m,
                PriceChange24h = 500m,
                PriceChangePercentage24h = 0.75m,
                CirculatingSupply = 19_600_000m,
                TotalSupply = 21_000_000m,
                High24h = 69000m,
                Low24h = 67000m,
                LastUpdated = now
            },
            new()
            {
                Id = "ethereum",
                Symbol = "eth",
                Name = "Ethereum",
                Image = "https://dummyimage.com/64x64/2d3748/fff&text=ETH",
                CurrentPrice = 3600m,
                MarketCap = 430_000_000_000m,
                MarketCapRank = 2,
                Volume24h = 10_000_000_000m,
                PriceChange24h = 35m,
                PriceChangePercentage24h = 0.98m,
                CirculatingSupply = 120_000_000m,
                TotalSupply = 120_000_000m,
                High24h = 3650m,
                Low24h = 3500m,
                LastUpdated = now
            },
            new()
            {
                Id = "solana",
                Symbol = "sol",
                Name = "Solana",
                Image = "https://dummyimage.com/64x64/0ea5e9/fff&text=SOL",
                CurrentPrice = 150m,
                MarketCap = 70_000_000_000m,
                MarketCapRank = 3,
                Volume24h = 3_500_000_000m,
                PriceChange24h = 4m,
                PriceChangePercentage24h = 2.7m,
                CirculatingSupply = 400_000_000m,
                TotalSupply = 560_000_000m,
                High24h = 152m,
                Low24h = 144m,
                LastUpdated = now
            }
        };
    }

    public Task<List<CryptoMarketDto>> GetMarketsAsync(int page = 1, int perPage = 50, string sortBy = "market_cap", string sortOrder = "desc")
    {
        var data = _markets
            .OrderByDescending(m => m.MarketCap)
            .Skip((page - 1) * perPage)
            .Take(perPage)
            .ToList();

        return Task.FromResult(data);
    }

    public Task<CryptoDetailDto?> GetCryptoDetailAsync(string id)
    {
        var market = _markets.FirstOrDefault(m => m.Id.Equals(id, StringComparison.OrdinalIgnoreCase) || m.Symbol.Equals(id, StringComparison.OrdinalIgnoreCase));
        if (market == null) return Task.FromResult<CryptoDetailDto?>(null);

        var detail = new CryptoDetailDto
        {
            Id = market.Id,
            Symbol = market.Symbol,
            Name = market.Name,
            Description = $"{market.Name} mock description (offline mode).",
            Image = market.Image,
            CurrentPrice = market.CurrentPrice,
            MarketCap = market.MarketCap,
            MarketCapRank = market.MarketCapRank,
            Volume24h = market.Volume24h,
            PriceChange24h = market.PriceChange24h,
            PriceChangePercentage24h = market.PriceChangePercentage24h,
            PriceChangePercentage7d = market.PriceChangePercentage24h * 3,
            PriceChangePercentage30d = market.PriceChangePercentage24h * 6,
            PriceChangePercentage1y = market.PriceChangePercentage24h * 10,
            High24h = market.High24h,
            Low24h = market.Low24h,
            AllTimeHigh = market.High24h * 1.1m,
            AllTimeHighDate = DateTime.UtcNow.AddMonths(-2),
            AllTimeLow = market.Low24h * 0.5m,
            AllTimeLowDate = DateTime.UtcNow.AddYears(-2),
            CirculatingSupply = market.CirculatingSupply,
            TotalSupply = market.TotalSupply,
            MaxSupply = market.TotalSupply,
            LastUpdated = DateTime.UtcNow
        };

        return Task.FromResult<CryptoDetailDto?>(detail);
    }

    public Task<PriceHistoryDto?> GetPriceHistoryAsync(string id, int days = 7)
    {
        var market = _markets.FirstOrDefault(m => m.Id.Equals(id, StringComparison.OrdinalIgnoreCase) || m.Symbol.Equals(id, StringComparison.OrdinalIgnoreCase));
        if (market == null) return Task.FromResult<PriceHistoryDto?>(null);

        var now = DateTime.UtcNow;
        var history = new PriceHistoryDto
        {
            Id = market.Id,
            Symbol = market.Symbol,
            Name = market.Name,
            Prices = Enumerable.Range(0, days)
                .Select(d => new PricePoint
                {
                    Timestamp = now.AddDays(-d),
                    Price = market.CurrentPrice * (1 - (decimal)d * 0.01m)
                }).Reverse().ToList(),
            MarketCaps = Enumerable.Range(0, days)
                .Select(d => new MarketCapPoint
                {
                    Timestamp = now.AddDays(-d),
                    MarketCap = market.MarketCap * (1 - (decimal)d * 0.01m)
                }).Reverse().ToList(),
            Volumes = Enumerable.Range(0, days)
                .Select(d => new VolumePoint
                {
                    Timestamp = now.AddDays(-d),
                    Volume = market.Volume24h * (1 - (decimal)d * 0.02m)
                }).Reverse().ToList()
        };

        return Task.FromResult<PriceHistoryDto?>(history);
    }

    public Task<List<CryptoMarketDto>> CompareCryptosAsync(string ids)
    {
        var idList = ids.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(x => x.ToLowerInvariant())
            .ToHashSet();

        var result = _markets.Where(m => idList.Contains(m.Id) || idList.Contains(m.Symbol)).ToList();
        return Task.FromResult(result);
    }

    public Task<List<CryptoMarketDto>> GetTopGainersLosersAsync(int limit = 10)
    {
        var sorted = _markets
            .OrderByDescending(m => m.PriceChangePercentage24h)
            .Take(limit)
            .ToList();
        return Task.FromResult(sorted);
    }
}
