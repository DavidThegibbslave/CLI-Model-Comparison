namespace CryptoMarket.Application.DTOs.Crypto;

public class CryptoAssetDto
{
    public string Id { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? Change24hPct { get; set; }
    public decimal? Volume24h { get; set; }
    public decimal? MarketCap { get; set; }
}
