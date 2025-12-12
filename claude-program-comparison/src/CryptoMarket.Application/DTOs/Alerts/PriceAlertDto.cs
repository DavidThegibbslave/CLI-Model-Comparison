namespace CryptoMarket.Application.DTOs.Alerts;

public class PriceAlertDto
{
    public Guid Id { get; set; }
    public string CryptoId { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal TargetPrice { get; set; }
    public bool IsAbove { get; set; }
    public bool IsActive { get; set; }
    public bool IsTriggered { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? TriggeredAt { get; set; }
    public decimal? CurrentPrice { get; set; } // Enriched data from live prices
}
