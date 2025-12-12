using System.ComponentModel.DataAnnotations;

namespace CryptoMarket.Application.DTOs.Store;

public class AddCartItemRequest
{
    [Required]
    public Guid ProductId { get; set; }

    [Range(1, 100)]
    public int Quantity { get; set; } = 1;
}
