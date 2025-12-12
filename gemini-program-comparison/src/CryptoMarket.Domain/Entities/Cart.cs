namespace CryptoMarket.Domain.Entities;

public class Cart
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; } // Nullable if we allow guest carts in future, but for now tied to auth
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<CartItem> Items { get; set; } = new();
}
