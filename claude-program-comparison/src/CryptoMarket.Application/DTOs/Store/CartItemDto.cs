namespace CryptoMarket.Application.DTOs.Store;

public class CartItemDto
{
    public Guid Id { get; set; }
    public string CryptoId { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal PriceAtAdd { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal Subtotal => Amount * CurrentPrice;
    public decimal PriceChange => CurrentPrice - PriceAtAdd;
    public decimal PriceChangePercentage => PriceAtAdd > 0 ? ((CurrentPrice - PriceAtAdd) / PriceAtAdd) * 100 : 0;
    public DateTime AddedAt { get; set; }
}
