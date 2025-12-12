namespace CryptoMarket.Application.DTOs.Portfolio;

public class CryptoHoldingDto
{
    public Guid Id { get; set; }
    public string CryptoId { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal AverageBuyPrice { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal TotalInvested => Amount * AverageBuyPrice;
    public decimal CurrentValue => Amount * CurrentPrice;
    public decimal ProfitLoss => CurrentValue - TotalInvested;
    public decimal ProfitLossPercentage => TotalInvested > 0 ? (ProfitLoss / TotalInvested) * 100 : 0;
    public DateTime FirstPurchaseDate { get; set; }
    public DateTime LastUpdated { get; set; }
}
