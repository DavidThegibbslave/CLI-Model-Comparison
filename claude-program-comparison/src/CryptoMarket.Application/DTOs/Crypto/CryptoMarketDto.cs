namespace CryptoMarket.Application.DTOs.Crypto;

public class CryptoMarketDto
{
    public string Id { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public decimal CurrentPrice { get; set; }
    public decimal MarketCap { get; set; }
    public int MarketCapRank { get; set; }
    public decimal Volume24h { get; set; }
    public decimal PriceChange24h { get; set; }
    public decimal PriceChangePercentage24h { get; set; }
    public decimal CirculatingSupply { get; set; }
    public decimal? TotalSupply { get; set; }
    public decimal High24h { get; set; }
    public decimal Low24h { get; set; }
    public DateTime LastUpdated { get; set; }
}
