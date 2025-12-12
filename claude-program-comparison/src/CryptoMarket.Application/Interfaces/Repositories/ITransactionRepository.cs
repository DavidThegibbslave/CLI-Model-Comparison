using CryptoMarket.Domain.Entities;

namespace CryptoMarket.Application.Interfaces.Repositories;

public interface ITransactionRepository
{
    Task<Transaction?> GetByIdAsync(Guid transactionId);
    Task<List<Transaction>> GetByPortfolioIdAsync(Guid portfolioId, int page = 1, int pageSize = 20);
    Task<Transaction> CreateAsync(Transaction transaction);
    Task<int> CountByPortfolioIdAsync(Guid portfolioId);
}
