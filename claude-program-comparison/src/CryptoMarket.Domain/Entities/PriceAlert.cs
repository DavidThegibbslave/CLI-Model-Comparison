namespace CryptoMarket.Domain.Entities;

public class PriceAlert
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string CryptoId { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal TargetPrice { get; set; }
    public bool IsAbove { get; set; } // true = alert when price goes above, false = below
    public bool IsActive { get; set; } = true;
    public bool IsTriggered { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? TriggeredAt { get; set; }

    // Navigation property
    public User User { get; set; } = null!;
}
