namespace CryptoMarket.Application.DTOs.Store;

public class CheckoutResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int ItemsPurchased { get; set; }
    public decimal TotalValue { get; set; }
    public List<string> PurchasedCryptos { get; set; } = new();
}
