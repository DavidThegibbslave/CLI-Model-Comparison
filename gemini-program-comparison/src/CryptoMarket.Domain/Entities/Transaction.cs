using System.ComponentModel.DataAnnotations.Schema;

namespace CryptoMarket.Domain.Entities;

public class Transaction
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string AssetId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "Buy" or "Sell"
    
    [Column(TypeName = "decimal(18,8)")]
    public decimal Quantity { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal PriceAtTransaction { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalUsd { get; set; }
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
