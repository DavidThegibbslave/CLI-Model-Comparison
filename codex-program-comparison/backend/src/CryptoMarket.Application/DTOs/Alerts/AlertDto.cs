namespace CryptoMarket.Application.DTOs.Alerts;

public class AlertDto
{
    public Guid Id { get; set; }
    public string CryptoAssetId { get; set; } = string.Empty;
    public string ConditionType { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public decimal ThresholdValue { get; set; }
    public string Channel { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
