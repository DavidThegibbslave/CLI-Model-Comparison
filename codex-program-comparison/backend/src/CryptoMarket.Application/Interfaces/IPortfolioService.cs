using CryptoMarket.Application.DTOs.Portfolio;

namespace CryptoMarket.Application.Interfaces;

public interface IPortfolioService
{
    Task<IReadOnlyList<PortfolioDto>> GetPortfoliosAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<PortfolioDto?> GetPortfolioAsync(Guid userId, Guid portfolioId, CancellationToken cancellationToken = default);
    Task<PortfolioDto> CreatePortfolioAsync(Guid userId, PortfolioRequest request, CancellationToken cancellationToken = default);
    Task<PortfolioDto?> UpdatePortfolioAsync(Guid userId, Guid portfolioId, PortfolioRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeletePortfolioAsync(Guid userId, Guid portfolioId, CancellationToken cancellationToken = default);
    Task<PortfolioDto?> AddPositionAsync(Guid userId, Guid portfolioId, PortfolioPositionRequest request, CancellationToken cancellationToken = default);
    Task<PortfolioDto?> RemovePositionAsync(Guid userId, Guid portfolioId, Guid positionId, CancellationToken cancellationToken = default);
}
