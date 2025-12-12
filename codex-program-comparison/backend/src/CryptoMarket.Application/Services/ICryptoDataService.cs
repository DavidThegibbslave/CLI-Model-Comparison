using CryptoMarket.Domain.Entities;

namespace CryptoMarket.Application.Services;

public interface ICryptoDataService
{
    Task<IReadOnlyList<CryptoAsset>> GetTopAssetsAsync(CancellationToken cancellationToken = default);
}
