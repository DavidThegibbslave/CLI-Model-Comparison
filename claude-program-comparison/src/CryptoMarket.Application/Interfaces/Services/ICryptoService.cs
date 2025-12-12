using CryptoMarket.Application.DTOs.Crypto;

namespace CryptoMarket.Application.Interfaces.Services;

public interface ICryptoService
{
    Task<List<CryptoMarketDto>> GetMarketsAsync(int page = 1, int perPage = 50, string sortBy = "market_cap", string sortOrder = "desc");
    Task<CryptoDetailDto?> GetCryptoDetailAsync(string id);
    Task<PriceHistoryDto?> GetPriceHistoryAsync(string id, int days = 7);
    Task<List<CryptoMarketDto>> CompareCryptosAsync(string ids);
    Task<List<CryptoMarketDto>> GetTopGainersLosersAsync(int limit = 10);
}
