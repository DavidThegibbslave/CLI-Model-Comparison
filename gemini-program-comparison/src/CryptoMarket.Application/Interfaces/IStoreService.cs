using CryptoMarket.Application.DTOs.Store;

namespace CryptoMarket.Application.Interfaces;

public interface IStoreService
{
    Task<List<ProductDto>> GetProductsAsync();
    Task<ProductDto?> GetProductAsync(Guid id);
    Task<CartDto> GetCartAsync(Guid userId);
    Task AddToCartAsync(Guid userId, AddToCartRequest request);
    Task RemoveFromCartAsync(Guid userId, Guid itemId);
    Task CheckoutAsync(Guid userId);
}
