namespace CryptoMarket.Application.DTOs.Crypto;

public class CryptoDetailDto
{
    public string Id { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public decimal CurrentPrice { get; set; }
    public decimal MarketCap { get; set; }
    public int MarketCapRank { get; set; }
    public decimal Volume24h { get; set; }
    public decimal PriceChange24h { get; set; }
    public decimal PriceChangePercentage24h { get; set; }
    public decimal PriceChangePercentage7d { get; set; }
    public decimal PriceChangePercentage30d { get; set; }
    public decimal PriceChangePercentage1y { get; set; }
    public decimal High24h { get; set; }
    public decimal Low24h { get; set; }
    public decimal AllTimeHigh { get; set; }
    public DateTime AllTimeHighDate { get; set; }
    public decimal AllTimeLow { get; set; }
    public DateTime AllTimeLowDate { get; set; }
    public decimal CirculatingSupply { get; set; }
    public decimal? TotalSupply { get; set; }
    public decimal? MaxSupply { get; set; }
    public DateTime LastUpdated { get; set; }
}
