using CryptoMarket.Application.DTOs.Crypto;
using CryptoMarket.Application.Interfaces;
using CryptoMarket.Application.Options;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CryptoMarket.Infrastructure.Services;

public class CryptoMarketService : ICryptoMarketService
{
    private readonly IExternalCryptoApiClient _apiClient;
    private readonly ICryptoAnalysisService _analysisService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<CryptoMarketService> _logger;
    private readonly CryptoApiOptions _options;
    private readonly MemoryCacheEntryOptions _cacheEntryOptions;

    private const string AssetsCacheKey = "crypto:assets";
    private static readonly List<CryptoAssetDto> _fallbackAssets = new()
    {
        new CryptoAssetDto { Id = "bitcoin", Symbol = "BTC", Name = "Bitcoin", Price = 62000m, Change24hPct = 1.2m, Volume24h = 1200000000m, MarketCap = 1200000000000m },
        new CryptoAssetDto { Id = "ethereum", Symbol = "ETH", Name = "Ethereum", Price = 3200m, Change24hPct = 1.8m, Volume24h = 800000000m, MarketCap = 400000000000m },
        new CryptoAssetDto { Id = "solana", Symbol = "SOL", Name = "Solana", Price = 145m, Change24hPct = -0.4m, Volume24h = 300000000m, MarketCap = 65000000000m }
    };

    public CryptoMarketService(
        IExternalCryptoApiClient apiClient,
        ICryptoAnalysisService analysisService,
        IMemoryCache cache,
        IOptions<CryptoApiOptions> options,
        ILogger<CryptoMarketService> logger)
    {
        _apiClient = apiClient;
        _analysisService = analysisService;
        _cache = cache;
        _logger = logger;
        _options = options.Value;
        _cacheEntryOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(Math.Clamp(_options.CacheSeconds, 10, 120))
        };
    }

    public async Task<IReadOnlyList<CryptoAssetDto>> GetAssetsAsync(CancellationToken cancellationToken = default)
    {
        if (_cache.TryGetValue<IReadOnlyList<CryptoAssetDto>>(AssetsCacheKey, out var cached) && cached != null)
        {
            return cached;
        }

        var assets = await _apiClient.GetAssetsAsync(cancellationToken);
        if (assets.Count == 0)
        {
            _logger.LogWarning("Using fallback assets because external API returned no data");
            assets = _fallbackAssets;
        }
        _cache.Set(AssetsCacheKey, assets, _cacheEntryOptions);
        return assets;
    }

    public async Task<CryptoAssetDetailDto?> GetAssetAsync(string id, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"crypto:asset:{id}";
        if (_cache.TryGetValue<CryptoAssetDetailDto>(cacheKey, out var cached) && cached != null)
        {
            return cached;
        }

        var asset = await _apiClient.GetAssetAsync(id, cancellationToken);
        if (asset == null)
        {
            var fallback = _fallbackAssets.FirstOrDefault(a => a.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
            if (fallback != null)
            {
                asset = new CryptoAssetDetailDto
                {
                    Id = fallback.Id,
                    Symbol = fallback.Symbol,
                    Name = fallback.Name,
                    Price = fallback.Price,
                    Change24hPct = fallback.Change24hPct,
                    Volume24h = fallback.Volume24h,
                    MarketCap = fallback.MarketCap
                };
            }
        }

        if (asset != null)
        {
            asset = _analysisService.ApplyTrends(asset);
            _cache.Set(cacheKey, asset, _cacheEntryOptions);
        }
        return asset;
    }

    public async Task<IReadOnlyList<PricePointDto>> GetHistoryAsync(string id, string days, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"crypto:history:{id}:{days}";
        if (_cache.TryGetValue<IReadOnlyList<PricePointDto>>(cacheKey, out var cached) && cached != null)
        {
            return cached;
        }

        var history = await _apiClient.GetHistoryAsync(id, days, cancellationToken);
        if (history.Count == 0)
        {
            history = new List<PricePointDto>
            {
                new() { Timestamp = DateTime.UtcNow.AddHours(-1), Price = 100m },
                new() { Timestamp = DateTime.UtcNow, Price = 101m }
            };
        }
        _cache.Set(cacheKey, history, _cacheEntryOptions);
        return history;
    }

    public async Task<IReadOnlyList<CryptoAssetDto>> GetTopMoversAsync(CancellationToken cancellationToken = default)
    {
        var assets = await GetAssetsAsync(cancellationToken);
        var limit = Math.Clamp(_options.TopLimit, 5, 50);
        return _analysisService.RankMovers(assets, limit);
    }

    public async Task<CompareResultDto> CompareAsync(IReadOnlyList<string> assetIds, CancellationToken cancellationToken = default)
    {
        if (assetIds == null || assetIds.Count < 2)
        {
            throw new ArgumentException("Provide at least two assetIds", nameof(assetIds));
        }

        var tasks = assetIds.Select(id => GetAssetAsync(id, cancellationToken)).ToArray();
        var results = await Task.WhenAll(tasks);
        var assets = results.Where(r => r != null).Cast<CryptoAssetDetailDto>().ToList();

        // Fallback: try to fetch from cached list if missing details
        if (assets.Count < assetIds.Count)
        {
            var cachedList = await GetAssetsAsync(cancellationToken);
            foreach (var id in assetIds)
            {
                if (assets.Any(a => a.Id.Equals(id, StringComparison.OrdinalIgnoreCase))) continue;
                var summary = cachedList.FirstOrDefault(a => a.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
                if (summary != null)
                {
                    assets.Add(new CryptoAssetDetailDto
                    {
                        Id = summary.Id,
                        Symbol = summary.Symbol,
                        Name = summary.Name,
                        Price = summary.Price,
                        Change24hPct = summary.Change24hPct,
                        Volume24h = summary.Volume24h,
                        MarketCap = summary.MarketCap
                    });
                }
            }
        }

        return new CompareResultDto { Assets = assets };
    }
}
