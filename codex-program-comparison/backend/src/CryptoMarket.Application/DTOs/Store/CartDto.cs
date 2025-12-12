namespace CryptoMarket.Application.DTOs.Store;

public class CartDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public IReadOnlyList<CartItemDto> Items { get; set; } = Array.Empty<CartItemDto>();
    public decimal Total => Items.Sum(i => i.Subtotal);
}
