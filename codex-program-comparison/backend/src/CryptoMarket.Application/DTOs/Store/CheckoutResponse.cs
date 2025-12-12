namespace CryptoMarket.Application.DTOs.Store;

public class CheckoutResponse
{
    public Guid CartId { get; set; }
    public string Message { get; set; } = "Cart cleared (demo only, no payment).";
    public DateTime ClearedAt { get; set; }
}
