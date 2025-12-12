namespace CryptoMarket.Domain.Entities;

public class PriceHistory
{
    public Guid Id { get; set; }
    public Guid CryptoAssetId { get; set; }
    public string Interval { get; set; } = "1h";
    public decimal Open { get; set; }
    public decimal High { get; set; }
    public decimal Low { get; set; }
    public decimal Close { get; set; }
    public decimal Volume { get; set; }
    public DateTime CapturedAt { get; set; }

    public CryptoAsset? CryptoAsset { get; set; }
}
