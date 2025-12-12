namespace CryptoMarket.Domain.Entities;

public class CryptoHolding
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string CryptoId { get; set; } = string.Empty; // CoinGecko ID
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal AveragePurchasePrice { get; set; }
    public DateTime FirstPurchaseDate { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Portfolio Portfolio { get; set; } = null!;
}
