using System.ComponentModel.DataAnnotations;

namespace CryptoMarket.Application.DTOs.Alerts;

public class AlertRequest
{
    [Required]
    [StringLength(100)]
    public string CryptoAssetId { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(price_up|price_down|volume_spike)$", ErrorMessage = "ConditionType must be price_up, price_down, or volume_spike.")]
    public string ConditionType { get; set; } = "price_up";

    [Required]
    [RegularExpression("^(above|below)$", ErrorMessage = "Direction must be above or below.")]
    public string Direction { get; set; } = "above";

    [Range(0.0, double.MaxValue)]
    public decimal ThresholdValue { get; set; }

    [Required]
    [RegularExpression("^(email|push)$", ErrorMessage = "Channel must be email or push.")]
    public string Channel { get; set; } = "email";
}
