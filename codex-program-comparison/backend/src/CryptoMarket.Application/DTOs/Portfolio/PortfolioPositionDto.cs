namespace CryptoMarket.Application.DTOs.Portfolio;

public class PortfolioPositionDto
{
    public Guid Id { get; set; }
    public string CryptoAssetId { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal AvgPrice { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal Value => Quantity * CurrentPrice;
    public decimal Pnl => (CurrentPrice - AvgPrice) * Quantity;
}
