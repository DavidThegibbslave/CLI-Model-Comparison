using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CryptoMarket.Domain.Entities;

public class Portfolio
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal BalanceUsd { get; set; } = 10000m; // Default 10k virtual cash
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public List<PortfolioPosition> Positions { get; set; } = new();
    public List<Transaction> Transactions { get; set; } = new();
}
