namespace CryptoMarket.Application.DTOs.Crypto;

public class PriceHistoryDto
{
    public string Id { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public List<PricePoint> Prices { get; set; } = new();
    public List<MarketCapPoint> MarketCaps { get; set; } = new();
    public List<VolumePoint> Volumes { get; set; } = new();
}

public class PricePoint
{
    public DateTime Timestamp { get; set; }
    public decimal Price { get; set; }
}

public class MarketCapPoint
{
    public DateTime Timestamp { get; set; }
    public decimal MarketCap { get; set; }
}

public class VolumePoint
{
    public DateTime Timestamp { get; set; }
    public decimal Volume { get; set; }
}
