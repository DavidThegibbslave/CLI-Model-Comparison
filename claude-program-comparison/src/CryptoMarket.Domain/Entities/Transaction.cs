using CryptoMarket.Domain.Enums;

namespace CryptoMarket.Domain.Entities;

public class Transaction
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string CryptoId { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public decimal PriceAtTransaction { get; set; }
    public decimal TotalValue { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Portfolio Portfolio { get; set; } = null!;
}
