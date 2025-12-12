using CryptoMarket.Application.DTOs.Store;

namespace CryptoMarket.Application.Interfaces;

public interface IStoreService
{
    Task<IReadOnlyList<ProductDto>> GetProductsAsync(CancellationToken cancellationToken = default);
    Task<ProductDto?> GetProductAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CartDto> GetCartAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<CartDto> AddItemAsync(Guid userId, AddCartItemRequest request, CancellationToken cancellationToken = default);
    Task<CartDto> RemoveItemAsync(Guid userId, Guid itemId, CancellationToken cancellationToken = default);
    Task<CheckoutResponse> CheckoutAsync(Guid userId, CancellationToken cancellationToken = default);
}
