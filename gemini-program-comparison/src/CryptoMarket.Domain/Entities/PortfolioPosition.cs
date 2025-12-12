using System.ComponentModel.DataAnnotations.Schema;

namespace CryptoMarket.Domain.Entities;

public class PortfolioPosition
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string AssetId { get; set; } = string.Empty; // e.g. "bitcoin"
    
    [Column(TypeName = "decimal(18,8)")]
    public decimal Quantity { get; set; }
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal AverageBuyPrice { get; set; }
}
