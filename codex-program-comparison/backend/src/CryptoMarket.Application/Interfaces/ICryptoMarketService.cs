using CryptoMarket.Application.DTOs.Crypto;

namespace CryptoMarket.Application.Interfaces;

public interface ICryptoMarketService
{
    Task<IReadOnlyList<CryptoAssetDto>> GetAssetsAsync(CancellationToken cancellationToken = default);
    Task<CryptoAssetDetailDto?> GetAssetAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PricePointDto>> GetHistoryAsync(string id, string days, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CryptoAssetDto>> GetTopMoversAsync(CancellationToken cancellationToken = default);
    Task<CompareResultDto> CompareAsync(IReadOnlyList<string> assetIds, CancellationToken cancellationToken = default);
}
