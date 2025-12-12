using System.Collections.Concurrent;
using CryptoMarket.Application.DTOs.Portfolio;
using CryptoMarket.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace CryptoMarket.Infrastructure.Services;

public class PortfolioService : IPortfolioService
{
    private readonly ICryptoMarketService _marketService;
    private readonly ILogger<PortfolioService> _logger;
    private static readonly ConcurrentDictionary<Guid, List<PortfolioState>> _portfolios = new();

    public PortfolioService(ICryptoMarketService marketService, ILogger<PortfolioService> logger)
    {
        _marketService = marketService;
        _logger = logger;
    }

    public Task<IReadOnlyList<PortfolioDto>> GetPortfoliosAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var list = _portfolios.GetOrAdd(userId, _ => new List<PortfolioState>());
        return MapPortfolios(list, cancellationToken);
    }

    public async Task<PortfolioDto?> GetPortfolioAsync(Guid userId, Guid portfolioId, CancellationToken cancellationToken = default)
    {
        var list = _portfolios.GetOrAdd(userId, _ => new List<PortfolioState>());
        var portfolio = list.FirstOrDefault(p => p.Id == portfolioId);
        if (portfolio == null) return null;
        var mapped = await MapPortfolio(portfolio, cancellationToken);
        return mapped;
    }

    public Task<PortfolioDto> CreatePortfolioAsync(Guid userId, PortfolioRequest request, CancellationToken cancellationToken = default)
    {
        var list = _portfolios.GetOrAdd(userId, _ => new List<PortfolioState>());
        var portfolio = new PortfolioState
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name.Trim(),
            RiskTolerance = request.RiskTolerance.Trim().ToLowerInvariant()
        };
        list.Add(portfolio);
        return MapPortfolio(portfolio, cancellationToken);
    }

    public async Task<PortfolioDto?> UpdatePortfolioAsync(Guid userId, Guid portfolioId, PortfolioRequest request, CancellationToken cancellationToken = default)
    {
        var list = _portfolios.GetOrAdd(userId, _ => new List<PortfolioState>());
        var portfolio = list.FirstOrDefault(p => p.Id == portfolioId);
        if (portfolio == null) return null;
        portfolio.Name = request.Name.Trim();
        portfolio.RiskTolerance = request.RiskTolerance.Trim().ToLowerInvariant();
        return await MapPortfolio(portfolio, cancellationToken);
    }

    public Task<bool> DeletePortfolioAsync(Guid userId, Guid portfolioId, CancellationToken cancellationToken = default)
    {
        var list = _portfolios.GetOrAdd(userId, _ => new List<PortfolioState>());
        var removed = list.RemoveAll(p => p.Id == portfolioId) > 0;
        return Task.FromResult(removed);
    }

    public async Task<PortfolioDto?> AddPositionAsync(Guid userId, Guid portfolioId, PortfolioPositionRequest request, CancellationToken cancellationToken = default)
    {
        var list = _portfolios.GetOrAdd(userId, _ => new List<PortfolioState>());
        var portfolio = list.FirstOrDefault(p => p.Id == portfolioId);
        if (portfolio == null) return null;

        var existing = portfolio.Positions.FirstOrDefault(p => p.CryptoAssetId.Equals(request.CryptoAssetId, StringComparison.OrdinalIgnoreCase));
        if (existing == null)
        {
            existing = new PortfolioPositionState
            {
                Id = Guid.NewGuid(),
                CryptoAssetId = request.CryptoAssetId.ToLowerInvariant(),
                Quantity = request.Quantity,
                AvgPrice = request.AvgPrice
            };
            portfolio.Positions.Add(existing);
        }
        else
        {
            // average price recalculation
            var totalCost = existing.AvgPrice * existing.Quantity + request.AvgPrice * request.Quantity;
            existing.Quantity += request.Quantity;
            if (existing.Quantity > 0)
            {
                existing.AvgPrice = totalCost / existing.Quantity;
            }
        }

        return await MapPortfolio(portfolio, cancellationToken);
    }

    public async Task<PortfolioDto?> RemovePositionAsync(Guid userId, Guid portfolioId, Guid positionId, CancellationToken cancellationToken = default)
    {
        var list = _portfolios.GetOrAdd(userId, _ => new List<PortfolioState>());
        var portfolio = list.FirstOrDefault(p => p.Id == portfolioId);
        if (portfolio == null) return null;
        portfolio.Positions.RemoveAll(p => p.Id == positionId);
        return await MapPortfolio(portfolio, cancellationToken);
    }

    private async Task<PortfolioDto> MapPortfolio(PortfolioState state, CancellationToken cancellationToken)
    {
        var positions = new List<PortfolioPositionDto>();
        foreach (var pos in state.Positions)
        {
            var asset = await _marketService.GetAssetAsync(pos.CryptoAssetId, cancellationToken) ?? new Application.DTOs.Crypto.CryptoAssetDetailDto
            {
                Id = pos.CryptoAssetId,
                Symbol = pos.CryptoAssetId.ToUpperInvariant(),
                Name = pos.CryptoAssetId
            };
            positions.Add(new PortfolioPositionDto
            {
                Id = pos.Id,
                CryptoAssetId = pos.CryptoAssetId,
                Symbol = asset.Symbol,
                Quantity = pos.Quantity,
                AvgPrice = pos.AvgPrice,
                CurrentPrice = asset.Price
            });
        }

        return new PortfolioDto
        {
            Id = state.Id,
            UserId = state.UserId,
            Name = state.Name,
            RiskTolerance = state.RiskTolerance,
            Positions = positions
        };
    }

    private Task<IReadOnlyList<PortfolioDto>> MapPortfolios(List<PortfolioState> list, CancellationToken cancellationToken)
    {
        var tasks = list.Select(p => MapPortfolio(p, cancellationToken)).ToArray();
        return Task.WhenAll(tasks).ContinueWith(t => (IReadOnlyList<PortfolioDto>)t.Result, cancellationToken);
    }

    private class PortfolioState
    {
        public Guid Id { get; init; }
        public Guid UserId { get; init; }
        public string Name { get; set; } = string.Empty;
        public string RiskTolerance { get; set; } = "medium";
        public List<PortfolioPositionState> Positions { get; } = new();
    }

    private class PortfolioPositionState
    {
        public Guid Id { get; init; }
        public string CryptoAssetId { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal AvgPrice { get; set; }
    }
}
