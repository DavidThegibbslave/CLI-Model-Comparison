namespace CryptoMarket.Domain.Entities;

public class PriceCache
{
    public string CryptoId { get; set; } = string.Empty; // Primary Key
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal CurrentPrice { get; set; }
    public decimal MarketCap { get; set; }
    public decimal Volume24h { get; set; }
    public decimal PriceChange24h { get; set; }
    public decimal PriceChangePercentage24h { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    public string ImageUrl { get; set; } = string.Empty;
}
