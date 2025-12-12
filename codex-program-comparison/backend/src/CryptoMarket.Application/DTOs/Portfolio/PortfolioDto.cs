namespace CryptoMarket.Application.DTOs.Portfolio;

public class PortfolioDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string RiskTolerance { get; set; } = string.Empty;
    public IReadOnlyList<PortfolioPositionDto> Positions { get; set; } = Array.Empty<PortfolioPositionDto>();
    public decimal TotalValue => Positions.Sum(p => p.Value);
    public decimal TotalPnl => Positions.Sum(p => p.Pnl);
}
