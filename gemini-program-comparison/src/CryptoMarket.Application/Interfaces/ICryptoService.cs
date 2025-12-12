using CryptoMarket.Application.DTOs.Market;
using CryptoMarket.Application.DTOs.Store;

namespace CryptoMarket.Application.Interfaces;

public interface ICryptoService
{
    Task<List<CoinGeckoPriceResponse>> GetTopAssetsAsync(int limit = 10);
    Task<CoinGeckoPriceResponse?> GetAssetAsync(string id);
    Task<List<decimal[]>> GetAssetHistoryAsync(string id, int days);
    Task<List<CoinGeckoPriceResponse>> CompareAssetsAsync(List<string> assetIds);
}