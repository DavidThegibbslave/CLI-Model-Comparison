using CryptoMarket.Application.DTOs.Crypto;

namespace CryptoMarket.Application.Interfaces;

public interface IExternalCryptoApiClient
{
    Task<IReadOnlyList<CryptoAssetDto>> GetAssetsAsync(CancellationToken cancellationToken = default);
    Task<CryptoAssetDetailDto?> GetAssetAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PricePointDto>> GetHistoryAsync(string id, string days, CancellationToken cancellationToken = default);
}
