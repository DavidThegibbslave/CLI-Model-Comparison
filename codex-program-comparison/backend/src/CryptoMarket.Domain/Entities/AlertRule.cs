namespace CryptoMarket.Domain.Entities;

public class AlertRule
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CryptoAssetId { get; set; }
    public string ConditionType { get; set; } = "price_up";
    public decimal ThresholdValue { get; set; }
    public string Direction { get; set; } = "above";
    public string Channel { get; set; } = "email";
    public bool IsActive { get; set; } = true;

    public User? User { get; set; }
    public CryptoAsset? CryptoAsset { get; set; }
}
