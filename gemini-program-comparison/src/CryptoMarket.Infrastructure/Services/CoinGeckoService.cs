using System.Text.Json;
using CryptoMarket.Application.DTOs.Market;
using CryptoMarket.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CryptoMarket.Infrastructure.Services;

public class CoinGeckoService : ICryptoService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<CoinGeckoService> _logger;
    private readonly string _baseUrl;

    public CoinGeckoService(HttpClient httpClient, IMemoryCache cache, IConfiguration configuration, ILogger<CoinGeckoService> logger)
    {
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;
        _baseUrl = configuration["CoinGecko:BaseUrl"] ?? "https://api.coingecko.com/api/v3/";
        
        if (!_baseUrl.EndsWith("/")) _baseUrl += "/";

        // _httpClient.BaseAddress = new Uri(_baseUrl); // Commented out to use absolute paths
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (compatible; CryptoMarketApp/1.0)");
    }

    public async Task<List<CoinGeckoPriceResponse>> GetTopAssetsAsync(int limit = 10)
    {
        string cacheKey = $"top_assets_{limit}";
        
        if (_cache.TryGetValue(cacheKey, out List<CoinGeckoPriceResponse>? cachedData) && cachedData != null)
        {
            return cachedData;
        }

        try
        {
            // Use absolute URL directly
            var requestUrl = $"{_baseUrl}coins/markets?vs_currency=usd&order=market_cap_desc&per_page={limit}&page=1&sparkline=false";
            _logger.LogInformation($"Fetching data from: {requestUrl}");
            
            var response = await _httpClient.GetAsync(requestUrl);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<List<CoinGeckoPriceResponse>>(content);

            if (data != null)
            {
                _cache.Set(cacheKey, data, TimeSpan.FromSeconds(60)); 
                return data;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching top assets from CoinGecko");
        }

        return new List<CoinGeckoPriceResponse>();
    }

    public async Task<CoinGeckoPriceResponse?> GetAssetAsync(string id)
    {
        var allAssets = await GetTopAssetsAsync(50); 
        var asset = allAssets.FirstOrDefault(a => a.Id == id);
        
        if (asset != null) return asset;
        return null;
    }

    public async Task<List<decimal[]>> GetAssetHistoryAsync(string id, int days)
    {
        string cacheKey = $"history_{id}_{days}";
        if (_cache.TryGetValue(cacheKey, out List<decimal[]>? cachedData) && cachedData != null)
        {
            return cachedData;
        }

        try 
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}coins/{id}/market_chart?vs_currency=usd&days={days}");
            response.EnsureSuccessStatusCode();
            
            var content = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(content);
            var prices = doc.RootElement.GetProperty("prices").EnumerateArray();
            
            var result = new List<decimal[]>();
            foreach (var p in prices)
            {
                result.Add(new decimal[] { 
                    p[0].GetDecimal(), 
                    p[1].GetDecimal() 
                });
            }

            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5)); 
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching history for {id}");
            return new List<decimal[]>();
        }
    }

    public async Task<List<CoinGeckoPriceResponse>> CompareAssetsAsync(List<string> assetIds)
    {
        // For MVP efficiency, we grab from top 50 assets cache.
        // Real world: call /coins/markets?ids=bitcoin,ethereum...
        var allAssets = await GetTopAssetsAsync(50);
        
        // Filter locally
        var result = allAssets
            .Where(a => assetIds.Contains(a.Id))
            .ToList();

        return result;
    }
}