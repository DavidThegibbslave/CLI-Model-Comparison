namespace CryptoMarket.Application.DTOs.Portfolio;

public class PortfolioDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public decimal TotalValue { get; set; }
    public decimal TotalInvested { get; set; }
    public decimal TotalProfitLoss => TotalValue - TotalInvested;
    public decimal TotalProfitLossPercentage => TotalInvested > 0 ? (TotalProfitLoss / TotalInvested) * 100 : 0;
    public List<CryptoHoldingDto> Holdings { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
