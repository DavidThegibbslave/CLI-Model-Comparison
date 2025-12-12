using System.ComponentModel.DataAnnotations;

namespace CryptoMarket.Application.DTOs.Portfolio;

public class PortfolioPositionRequest
{
    [Required]
    [StringLength(100)]
    public string CryptoAssetId { get; set; } = string.Empty;

    [Range(0.00000001, double.MaxValue)]
    public decimal Quantity { get; set; }

    [Range(0.0, double.MaxValue)]
    public decimal AvgPrice { get; set; }
}
