using System.ComponentModel.DataAnnotations;

namespace CryptoMarket.Application.DTOs.Portfolio;

public class CreatePortfolioRequest
{
    [Required]
    [MinLength(3)]
    public string Name { get; set; } = string.Empty;
}

public class OrderRequest
{
    [Required]
    public string AssetId { get; set; } = string.Empty;
    
    [Required]
    [Range(0.00000001, double.MaxValue, ErrorMessage = "Quantity must be greater than 0")]
    public decimal Quantity { get; set; }
}

public class PortfolioDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal BalanceUsd { get; set; }
    public decimal TotalValueUsd { get; set; } // Balance + Holdings Value
    public List<PortfolioPositionDto> Positions { get; set; } = new();
}

public class PortfolioPositionDto
{
    public string AssetId { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal AverageBuyPrice { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal ProfitLoss { get; set; }
    public decimal ProfitLossPercentage { get; set; }
}

public class TransactionDto
{
    public Guid Id { get; set; }
    public string AssetId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal PriceAtTransaction { get; set; }
    public decimal TotalUsd { get; set; }
    public DateTime Timestamp { get; set; }
}
