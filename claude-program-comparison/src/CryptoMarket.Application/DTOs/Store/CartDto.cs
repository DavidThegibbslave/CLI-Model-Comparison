namespace CryptoMarket.Application.DTOs.Store;

public class CartDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public List<CartItemDto> Items { get; set; } = new();
    public int TotalItems => Items.Count;
    public decimal TotalValue => Items.Sum(i => i.Subtotal);
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
