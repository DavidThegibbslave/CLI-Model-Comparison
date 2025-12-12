namespace CryptoMarket.Application.DTOs.Store;

public class AddToCartDto
{
    public string CryptoId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
