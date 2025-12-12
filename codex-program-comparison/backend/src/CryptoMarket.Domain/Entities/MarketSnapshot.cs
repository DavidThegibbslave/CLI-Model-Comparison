namespace CryptoMarket.Domain.Entities;

public class MarketSnapshot
{
    public Guid Id { get; set; }
    public Guid CryptoAssetId { get; set; }
    public decimal Price { get; set; }
    public decimal Volume24h { get; set; }
    public decimal MarketCap { get; set; }
    public decimal ChangePct24h { get; set; }
    public decimal LiquidityScore { get; set; }
    public DateTime CapturedAt { get; set; }

    public CryptoAsset? CryptoAsset { get; set; }
}
