using CryptoMarket.Domain.Entities;

namespace CryptoMarket.Application.Interfaces.Repositories;

public interface ICartRepository
{
    Task<Cart?> GetByUserIdAsync(Guid userId);
    Task<Cart?> GetByIdAsync(Guid cartId);
    Task<Cart> CreateAsync(Cart cart);
    Task<Cart> UpdateAsync(Cart cart);
    Task DeleteAsync(Guid cartId);
}
