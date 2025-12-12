namespace CryptoMarket.Application.DTOs.Crypto;

public class CryptoAssetDetailDto : CryptoAssetDto
{
    public decimal? Supply { get; set; }
    public decimal? MaxSupply { get; set; }
    public decimal? High24h { get; set; }
    public decimal? Low24h { get; set; }
    public decimal? Change7dPct { get; set; }
    public decimal? Change30dPct { get; set; }
}
