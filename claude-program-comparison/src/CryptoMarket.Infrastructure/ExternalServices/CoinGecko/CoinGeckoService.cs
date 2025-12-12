using System.Text.Json;
using CryptoMarket.Application.DTOs.Crypto;
using CryptoMarket.Application.Interfaces.Services;
using CryptoMarket.Infrastructure.ExternalServices.CoinGecko.Models;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CryptoMarket.Infrastructure.ExternalServices.CoinGecko;

public class CoinGeckoService : ICryptoService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMemoryCache _cache;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CoinGeckoService> _logger;
    private readonly int _cacheDuration;

    public CoinGeckoService(
        IHttpClientFactory httpClientFactory,
        IMemoryCache cache,
        IConfiguration configuration,
        ILogger<CoinGeckoService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _cache = cache;
        _configuration = configuration;
        _logger = logger;
        _cacheDuration = configuration.GetValue<int>("CoinGecko:CacheDurationSeconds", 30);
    }

    public async Task<List<CryptoMarketDto>> GetMarketsAsync(int page = 1, int perPage = 50, string sortBy = "market_cap", string sortOrder = "desc")
    {
        var cacheKey = $"markets_{page}_{perPage}_{sortBy}_{sortOrder}";

        if (_cache.TryGetValue<List<CryptoMarketDto>>(cacheKey, out var cachedData) && cachedData != null)
        {
            _logger.LogInformation("Returning cached market data");
            return cachedData;
        }

        try
        {
            var client = _httpClientFactory.CreateClient("CoinGecko");
            var response = await client.GetAsync($"coins/markets?vs_currency=usd&order={sortBy}_{sortOrder}&per_page={perPage}&page={page}&sparkline=false");

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var apiData = JsonSerializer.Deserialize<List<CoinGeckoMarketResponse>>(json);

            if (apiData == null)
            {
                return new List<CryptoMarketDto>();
            }

            var result = apiData.Select(x => new CryptoMarketDto
            {
                Id = x.Id,
                Symbol = x.Symbol,
                Name = x.Name,
                Image = x.Image,
                CurrentPrice = x.CurrentPrice,
                MarketCap = x.MarketCap,
                MarketCapRank = x.MarketCapRank,
                Volume24h = x.TotalVolume,
                PriceChange24h = x.PriceChange24h,
                PriceChangePercentage24h = x.PriceChangePercentage24h,
                CirculatingSupply = x.CirculatingSupply,
                TotalSupply = x.TotalSupply,
                High24h = x.High24h,
                Low24h = x.Low24h,
                LastUpdated = x.LastUpdated
            }).ToList();

            _cache.Set(cacheKey, result, TimeSpan.FromSeconds(_cacheDuration));
            _logger.LogInformation($"Fetched {result.Count} cryptocurrencies from CoinGecko API");

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching market data from CoinGecko");
            throw;
        }
    }

    public async Task<CryptoDetailDto?> GetCryptoDetailAsync(string id)
    {
        var cacheKey = $"detail_{id}";

        if (_cache.TryGetValue<CryptoDetailDto>(cacheKey, out var cachedData) && cachedData != null)
        {
            _logger.LogInformation($"Returning cached detail for {id}");
            return cachedData;
        }

        try
        {
            var client = _httpClientFactory.CreateClient("CoinGecko");
            var response = await client.GetAsync($"coins/{id}?localization=false&tickers=false&community_data=false&developer_data=false");

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var json = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var apiData = JsonSerializer.Deserialize<JsonElement>(json, options);

            var result = new CryptoDetailDto
            {
                Id = apiData.GetProperty("id").GetString() ?? string.Empty,
                Symbol = apiData.GetProperty("symbol").GetString() ?? string.Empty,
                Name = apiData.GetProperty("name").GetString() ?? string.Empty,
                Description = apiData.GetProperty("description").GetProperty("en").GetString() ?? string.Empty,
                Image = apiData.GetProperty("image").GetProperty("large").GetString() ?? string.Empty,
                CurrentPrice = apiData.GetProperty("market_data").GetProperty("current_price").GetProperty("usd").GetDecimal(),
                MarketCap = apiData.GetProperty("market_data").GetProperty("market_cap").GetProperty("usd").GetDecimal(),
                MarketCapRank = apiData.GetProperty("market_cap_rank").GetInt32(),
                Volume24h = apiData.GetProperty("market_data").GetProperty("total_volume").GetProperty("usd").GetDecimal(),
                PriceChange24h = apiData.GetProperty("market_data").GetProperty("price_change_24h").GetDecimal(),
                PriceChangePercentage24h = apiData.GetProperty("market_data").GetProperty("price_change_percentage_24h").GetDecimal(),
                High24h = apiData.GetProperty("market_data").GetProperty("high_24h").GetProperty("usd").GetDecimal(),
                Low24h = apiData.GetProperty("market_data").GetProperty("low_24h").GetProperty("usd").GetDecimal(),
                CirculatingSupply = apiData.GetProperty("market_data").GetProperty("circulating_supply").GetDecimal(),
                LastUpdated = apiData.GetProperty("last_updated").GetDateTime()
            };

            _cache.Set(cacheKey, result, TimeSpan.FromSeconds(_cacheDuration));
            _logger.LogInformation($"Fetched details for {id} from CoinGecko API");

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching detail for {id} from CoinGecko");
            return null;
        }
    }

    public async Task<PriceHistoryDto?> GetPriceHistoryAsync(string id, int days = 7)
    {
        var cacheKey = $"history_{id}_{days}";

        if (_cache.TryGetValue<PriceHistoryDto>(cacheKey, out var cachedData) && cachedData != null)
        {
            return cachedData;
        }

        try
        {
            var client = _httpClientFactory.CreateClient("CoinGecko");
            var response = await client.GetAsync($"coins/{id}/market_chart?vs_currency=usd&days={days}");

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var json = await response.Content.ReadAsStringAsync();
            var apiData = JsonSerializer.Deserialize<JsonElement>(json);

            var result = new PriceHistoryDto
            {
                Id = id,
                Prices = ParsePriceData(apiData.GetProperty("prices")),
                MarketCaps = ParseMarketCapData(apiData.GetProperty("market_caps")),
                Volumes = ParseVolumeData(apiData.GetProperty("total_volumes"))
            };

            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching history for {id}");
            return null;
        }
    }

    public async Task<List<CryptoMarketDto>> CompareCryptosAsync(string ids)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("CoinGecko");
            var response = await client.GetAsync($"coins/markets?vs_currency=usd&ids={ids}&order=market_cap_desc&sparkline=false");

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var apiData = JsonSerializer.Deserialize<List<CoinGeckoMarketResponse>>(json);

            if (apiData == null)
            {
                return new List<CryptoMarketDto>();
            }

            return apiData.Select(x => new CryptoMarketDto
            {
                Id = x.Id,
                Symbol = x.Symbol,
                Name = x.Name,
                Image = x.Image,
                CurrentPrice = x.CurrentPrice,
                MarketCap = x.MarketCap,
                MarketCapRank = x.MarketCapRank,
                Volume24h = x.TotalVolume,
                PriceChange24h = x.PriceChange24h,
                PriceChangePercentage24h = x.PriceChangePercentage24h,
                CirculatingSupply = x.CirculatingSupply,
                TotalSupply = x.TotalSupply,
                High24h = x.High24h,
                Low24h = x.Low24h,
                LastUpdated = x.LastUpdated
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error comparing cryptos");
            throw;
        }
    }

    public async Task<List<CryptoMarketDto>> GetTopGainersLosersAsync(int limit = 10)
    {
        var markets = await GetMarketsAsync(1, 100);
        return markets.OrderByDescending(x => x.PriceChangePercentage24h).Take(limit).ToList();
    }

    private static List<PricePoint> ParsePriceData(JsonElement prices)
    {
        return prices.EnumerateArray()
            .Select(p =>
            {
                var array = p.EnumerateArray().ToList();
                return new PricePoint
                {
                    Timestamp = DateTimeOffset.FromUnixTimeMilliseconds((long)array[0].GetDouble()).UtcDateTime,
                    Price = array[1].GetDecimal()
                };
            }).ToList();
    }

    private static List<MarketCapPoint> ParseMarketCapData(JsonElement marketCaps)
    {
        return marketCaps.EnumerateArray()
            .Select(p =>
            {
                var array = p.EnumerateArray().ToList();
                return new MarketCapPoint
                {
                    Timestamp = DateTimeOffset.FromUnixTimeMilliseconds((long)array[0].GetDouble()).UtcDateTime,
                    MarketCap = array[1].GetDecimal()
                };
            }).ToList();
    }

    private static List<VolumePoint> ParseVolumeData(JsonElement volumes)
    {
        return volumes.EnumerateArray()
            .Select(p =>
            {
                var array = p.EnumerateArray().ToList();
                return new VolumePoint
                {
                    Timestamp = DateTimeOffset.FromUnixTimeMilliseconds((long)array[0].GetDouble()).UtcDateTime,
                    Volume = array[1].GetDecimal()
                };
            }).ToList();
    }
}
