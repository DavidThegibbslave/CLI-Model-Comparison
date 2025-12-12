namespace CryptoMarket.Domain.Entities;

public class Product
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public decimal PriceUsd { get; set; }
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? AssetSymbolRef { get; set; }
    public bool Available { get; set; } = true;

    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}
