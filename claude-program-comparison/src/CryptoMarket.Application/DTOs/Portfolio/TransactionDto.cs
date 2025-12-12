using CryptoMarket.Domain.Enums;

namespace CryptoMarket.Application.DTOs.Portfolio;

public class TransactionDto
{
    public Guid Id { get; set; }
    public string CryptoId { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public decimal PriceAtTransaction { get; set; }
    public decimal TotalValue => Amount * PriceAtTransaction;
    public DateTime TransactionDate { get; set; }
}
