using CryptoMarket.Application.DTOs.Store;

namespace CryptoMarket.Application.Interfaces.Services;

public interface ICartService
{
    Task<CartDto> GetCartAsync(Guid userId);
    Task<CartDto> AddToCartAsync(Guid userId, AddToCartDto addToCartDto);
    Task<CartDto> UpdateCartItemAsync(Guid userId, Guid cartItemId, UpdateCartItemDto updateDto);
    Task<CartDto> RemoveFromCartAsync(Guid userId, Guid cartItemId);
    Task<CartDto> ClearCartAsync(Guid userId);
    Task<CheckoutResultDto> CheckoutAsync(Guid userId);
}
