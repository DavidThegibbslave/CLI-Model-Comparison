using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using CryptoMarket.Application.DTOs.Crypto;
using CryptoMarket.Application.Interfaces;
using CryptoMarket.Application.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CryptoMarket.Infrastructure.ExternalApis;

public class CoinGeckoClient : IExternalCryptoApiClient
{
    private readonly HttpClient _httpClient;
    private readonly CryptoApiOptions _options;
    private readonly ILogger<CoinGeckoClient> _logger;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true,
        NumberHandling = JsonNumberHandling.AllowReadingFromString
    };

    public CoinGeckoClient(HttpClient httpClient, IOptions<CryptoApiOptions> options, ILogger<CoinGeckoClient> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;

        if (!string.IsNullOrWhiteSpace(_options.BaseUrl))
        {
            _httpClient.BaseAddress = new Uri(_options.BaseUrl);
        }

        if (!string.IsNullOrWhiteSpace(_options.ApiKey) && !string.IsNullOrWhiteSpace(_options.ApiKeyHeader))
        {
            _httpClient.DefaultRequestHeaders.TryAddWithoutValidation(_options.ApiKeyHeader, _options.ApiKey);
        }
        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("CryptoMarket/1.0");
    }

    public async Task<IReadOnlyList<CryptoAssetDto>> GetAssetsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var url = "coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&price_change_percentage=24h";
            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();
            var data = await response.Content.ReadFromJsonAsync<List<CoinGeckoMarketItem>>(_jsonOptions, cancellationToken);
            return (data ?? new()).Select(MapMarketItem).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch assets from CoinGecko");
            return Array.Empty<CryptoAssetDto>();
        }
    }

    public async Task<CryptoAssetDetailDto?> GetAssetAsync(string id, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync($"coins/{id}?localization=false&market_data=true&sparkline=false", cancellationToken);
            response.EnsureSuccessStatusCode();
            var data = await response.Content.ReadFromJsonAsync<CoinGeckoCoinDetail>(_jsonOptions, cancellationToken);
            if (data is null || data.MarketData is null)
            {
                return null;
            }

            return new CryptoAssetDetailDto
            {
                Id = data.Id ?? string.Empty,
                Symbol = data.Symbol?.ToUpperInvariant() ?? string.Empty,
                Name = data.Name ?? string.Empty,
                Price = TryGetDecimal(data.MarketData.CurrentPrice, "usd"),
                Change24hPct = data.MarketData.PriceChangePercentage24h,
                Volume24h = TryGetDecimal(data.MarketData.TotalVolume, "usd"),
                MarketCap = TryGetDecimal(data.MarketData.MarketCap, "usd"),
                Supply = data.MarketData.CirculatingSupply,
                MaxSupply = data.MarketData.MaxSupply,
                High24h = TryGetDecimal(data.MarketData.High24h, "usd"),
                Low24h = TryGetDecimal(data.MarketData.Low24h, "usd"),
                Change7dPct = data.MarketData.PriceChangePercentage7d,
                Change30dPct = data.MarketData.PriceChangePercentage30d
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch asset {AssetId} from CoinGecko", id);
            return null;
        }
    }

    public async Task<IReadOnlyList<PricePointDto>> GetHistoryAsync(string id, string days, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync($"coins/{id}/market_chart?vs_currency=usd&days={days}", cancellationToken);
            response.EnsureSuccessStatusCode();
            var data = await response.Content.ReadFromJsonAsync<CoinGeckoMarketChart>(_jsonOptions, cancellationToken);
            if (data?.Prices == null)
            {
                return Array.Empty<PricePointDto>();
            }

            return data.Prices.Select(p => new PricePointDto
            {
                Timestamp = DateTimeOffset.FromUnixTimeMilliseconds((long)p[0]).UtcDateTime,
                Price = (decimal)p[1]
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch history for {AssetId}", id);
            return Array.Empty<PricePointDto>();
        }
    }

    private static CryptoAssetDto MapMarketItem(CoinGeckoMarketItem item) => new()
    {
        Id = item.Id ?? string.Empty,
        Symbol = item.Symbol?.ToUpperInvariant() ?? string.Empty,
        Name = item.Name ?? string.Empty,
        Price = item.CurrentPrice,
        Change24hPct = item.PriceChangePercentage24h,
        Volume24h = item.TotalVolume,
        MarketCap = item.MarketCap
    };

    private record CoinGeckoMarketItem(
        [property: JsonPropertyName("id")] string? Id,
        [property: JsonPropertyName("symbol")] string? Symbol,
        [property: JsonPropertyName("name")] string? Name,
        [property: JsonPropertyName("current_price")] decimal CurrentPrice,
        [property: JsonPropertyName("market_cap")] decimal? MarketCap,
        [property: JsonPropertyName("total_volume")] decimal? TotalVolume,
        [property: JsonPropertyName("price_change_percentage_24h")] decimal? PriceChangePercentage24h
    );

    private record CoinGeckoCoinDetail
    {
        [JsonPropertyName("id")]
        public string? Id { get; init; }

        [JsonPropertyName("symbol")]
        public string? Symbol { get; init; }

        [JsonPropertyName("name")]
        public string? Name { get; init; }

        [JsonPropertyName("market_data")]
        public CoinGeckoMarketData? MarketData { get; init; }
    }

    private record CoinGeckoMarketData
    {
        [JsonPropertyName("current_price")]
        public Dictionary<string, decimal>? CurrentPrice { get; init; }

        [JsonPropertyName("high_24h")]
        public Dictionary<string, decimal>? High24h { get; init; }

        [JsonPropertyName("low_24h")]
        public Dictionary<string, decimal>? Low24h { get; init; }

        [JsonPropertyName("price_change_percentage_24h")]
        public decimal? PriceChangePercentage24h { get; init; }

        [JsonPropertyName("price_change_percentage_7d")]
        public decimal? PriceChangePercentage7d { get; init; }

        [JsonPropertyName("price_change_percentage_30d")]
        public decimal? PriceChangePercentage30d { get; init; }

        [JsonPropertyName("market_cap")]
        public Dictionary<string, decimal>? MarketCap { get; init; }

        [JsonPropertyName("total_volume")]
        public Dictionary<string, decimal>? TotalVolume { get; init; }

        [JsonPropertyName("circulating_supply")]
        public decimal? CirculatingSupply { get; init; }

        [JsonPropertyName("max_supply")]
        public decimal? MaxSupply { get; init; }
    }

    private record CoinGeckoMarketChart
    {
        [JsonPropertyName("prices")]
        public List<List<double>>? Prices { get; init; }
    }

    private static decimal TryGetDecimal(Dictionary<string, decimal>? map, string key)
    {
        return map != null && map.TryGetValue(key, out var value) ? value : 0m;
    }
}
