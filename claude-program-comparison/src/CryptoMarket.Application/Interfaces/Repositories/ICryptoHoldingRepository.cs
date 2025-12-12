using CryptoMarket.Domain.Entities;

namespace CryptoMarket.Application.Interfaces.Repositories;

public interface ICryptoHoldingRepository
{
    Task<CryptoHolding?> GetByIdAsync(Guid holdingId);
    Task<CryptoHolding?> GetByPortfolioAndCryptoAsync(Guid portfolioId, string cryptoId);
    Task<List<CryptoHolding>> GetByPortfolioIdAsync(Guid portfolioId);
    Task<CryptoHolding> CreateAsync(CryptoHolding holding);
    Task<CryptoHolding> UpdateAsync(CryptoHolding holding);
    Task DeleteAsync(Guid holdingId);
}
