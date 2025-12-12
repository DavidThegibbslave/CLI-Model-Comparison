using CryptoMarket.Application.DTOs.Portfolio;

namespace CryptoMarket.Application.Interfaces;

public interface IPortfolioService
{
    Task<List<PortfolioDto>> GetUserPortfoliosAsync(Guid userId);
    Task<PortfolioDto?> GetPortfolioAsync(Guid portfolioId, Guid userId);
    Task<PortfolioDto> CreatePortfolioAsync(Guid userId, CreatePortfolioRequest request);
    Task<PortfolioDto> ExecuteOrderAsync(Guid userId, Guid portfolioId, OrderRequest request, string type); // type = "Buy" or "Sell"
    Task<List<TransactionDto>> GetTransactionsAsync(Guid userId, Guid portfolioId);
}
