using CryptoMarket.Application.DTOs.Portfolio;

namespace CryptoMarket.Application.Interfaces.Services;

public interface IPortfolioService
{
    Task<PortfolioDto> GetPortfolioAsync(Guid userId);
    Task<List<TransactionDto>> GetTransactionsAsync(Guid userId, int page = 1, int pageSize = 20);
    Task<PortfolioPerformanceDto> GetPerformanceAsync(Guid userId);
    Task<CryptoHoldingDto?> GetHoldingAsync(Guid userId, string cryptoId);
}
