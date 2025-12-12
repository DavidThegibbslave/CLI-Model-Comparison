namespace CryptoMarket.Application.DTOs.Crypto;

public class CompareResultDto
{
    public IReadOnlyList<CryptoAssetDetailDto> Assets { get; set; } = Array.Empty<CryptoAssetDetailDto>();
}
