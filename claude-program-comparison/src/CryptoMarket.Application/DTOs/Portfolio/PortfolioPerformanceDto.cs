namespace CryptoMarket.Application.DTOs.Portfolio;

public class PortfolioPerformanceDto
{
    public decimal TotalValue { get; set; }
    public decimal TotalInvested { get; set; }
    public decimal TotalProfitLoss { get; set; }
    public decimal TotalProfitLossPercentage { get; set; }
    public int TotalHoldings { get; set; }
    public int TotalTransactions { get; set; }
    public CryptoHoldingDto? BestPerformer { get; set; }
    public CryptoHoldingDto? WorstPerformer { get; set; }
    public List<HoldingAllocationDto> Allocations { get; set; } = new();
}

public class HoldingAllocationDto
{
    public string CryptoId { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public decimal Percentage { get; set; }
}
