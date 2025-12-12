using CryptoMarket.Application.DTOs.Crypto;

namespace CryptoMarket.Application.Interfaces;

public interface ICryptoAnalysisService
{
    IReadOnlyList<CryptoAssetDto> RankMovers(IEnumerable<CryptoAssetDto> assets, int limit);
    CryptoAssetDetailDto ApplyTrends(CryptoAssetDetailDto asset);
}
