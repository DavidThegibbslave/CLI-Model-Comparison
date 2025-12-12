namespace CryptoMarket.Domain.Entities;

public class PortfolioPosition
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public Guid CryptoAssetId { get; set; }
    public decimal Quantity { get; set; }
    public decimal AvgPrice { get; set; }

    public Portfolio? Portfolio { get; set; }
    public CryptoAsset? CryptoAsset { get; set; }
}
