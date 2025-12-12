using System.ComponentModel.DataAnnotations;

namespace CryptoMarket.Application.DTOs.Portfolio;

public class PortfolioRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(low|medium|high)$", ErrorMessage = "RiskTolerance must be low, medium, or high.")]
    public string RiskTolerance { get; set; } = "medium";
}
