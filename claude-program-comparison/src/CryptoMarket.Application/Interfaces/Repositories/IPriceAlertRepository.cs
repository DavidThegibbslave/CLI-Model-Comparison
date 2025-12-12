using CryptoMarket.Domain.Entities;

namespace CryptoMarket.Application.Interfaces.Repositories;

public interface IPriceAlertRepository
{
    Task<PriceAlert?> GetByIdAsync(Guid id);
    Task<List<PriceAlert>> GetByUserIdAsync(Guid userId);
    Task<List<PriceAlert>> GetActiveAlertsAsync();
    Task<PriceAlert> CreateAsync(PriceAlert alert);
    Task UpdateAsync(PriceAlert alert);
    Task DeleteAsync(Guid id);
}
