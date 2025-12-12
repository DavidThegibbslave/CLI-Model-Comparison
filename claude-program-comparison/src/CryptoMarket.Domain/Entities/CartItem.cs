namespace CryptoMarket.Domain.Entities;

public class CartItem
{
    public Guid Id { get; set; }
    public Guid CartId { get; set; }
    public string CryptoId { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal PriceAtAdd { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Cart Cart { get; set; } = null!;
}
