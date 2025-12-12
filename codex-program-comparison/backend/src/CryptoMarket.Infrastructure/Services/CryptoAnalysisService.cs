using CryptoMarket.Application.DTOs.Crypto;
using CryptoMarket.Application.Interfaces;

namespace CryptoMarket.Infrastructure.Services;

public class CryptoAnalysisService : ICryptoAnalysisService
{
    public IReadOnlyList<CryptoAssetDto> RankMovers(IEnumerable<CryptoAssetDto> assets, int limit)
    {
        return assets
            .OrderByDescending(a => a.Change24hPct ?? 0m)
            .Take(limit)
            .ToList();
    }

    public CryptoAssetDetailDto ApplyTrends(CryptoAssetDetailDto asset)
    {
        // Placeholder for additional trend logic; currently returns input.
        return asset;
    }
}
