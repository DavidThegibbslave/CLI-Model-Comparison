namespace CryptoMarket.Domain.Entities;

public class CryptoAsset
{
    public Guid Id { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Source { get; set; } = "Binance";
    public string Status { get; set; } = "active";

    public ICollection<MarketSnapshot> MarketSnapshots { get; set; } = new List<MarketSnapshot>();
    public ICollection<PriceHistory> PriceHistory { get; set; } = new List<PriceHistory>();
    public ICollection<PortfolioPosition> Positions { get; set; } = new List<PortfolioPosition>();
    public ICollection<AlertRule> AlertRules { get; set; } = new List<AlertRule>();
}
