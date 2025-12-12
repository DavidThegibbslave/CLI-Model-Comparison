using System.ComponentModel.DataAnnotations;

namespace CryptoMarket.Application.DTOs.Store;

public class ProductDto
{
    public Guid Id { get; set; }

    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    [Range(0.0, double.MaxValue)]
    public decimal Price { get; set; }

    public string? ImageUrl { get; set; }

    [Required]
    [StringLength(100)]
    public string Category { get; set; } = string.Empty;
}
