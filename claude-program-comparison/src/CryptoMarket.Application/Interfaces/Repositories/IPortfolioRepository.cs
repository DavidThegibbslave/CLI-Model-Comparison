using CryptoMarket.Domain.Entities;

namespace CryptoMarket.Application.Interfaces.Repositories;

public interface IPortfolioRepository
{
    Task<Portfolio?> GetByUserIdAsync(Guid userId);
    Task<Portfolio?> GetByIdAsync(Guid portfolioId);
    Task<Portfolio> CreateAsync(Portfolio portfolio);
    Task<Portfolio> UpdateAsync(Portfolio portfolio);
}
