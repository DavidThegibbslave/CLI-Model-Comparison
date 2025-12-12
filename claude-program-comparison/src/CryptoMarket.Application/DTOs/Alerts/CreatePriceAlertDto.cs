namespace CryptoMarket.Application.DTOs.Alerts;

public class CreatePriceAlertDto
{
    public string CryptoId { get; set; } = string.Empty;
    public decimal TargetPrice { get; set; }
    public bool IsAbove { get; set; } // true = alert when price goes above, false = below
}
