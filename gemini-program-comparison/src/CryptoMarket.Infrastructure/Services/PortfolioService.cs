using CryptoMarket.Application.DTOs.Portfolio;
using CryptoMarket.Application.Interfaces;
using CryptoMarket.Domain.Entities;
using CryptoMarket.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CryptoMarket.Infrastructure.Services;

public class PortfolioService : IPortfolioService
{
    private readonly AppDbContext _context;
    private readonly ICryptoService _cryptoService;

    public PortfolioService(AppDbContext context, ICryptoService cryptoService)
    {
        _context = context;
        _cryptoService = cryptoService;
    }

    public async Task<List<PortfolioDto>> GetUserPortfoliosAsync(Guid userId)
    {
        var portfolios = await _context.Portfolios
            .Include(p => p.Positions)
            .Where(p => p.UserId == userId)
            .ToListAsync();

        var result = new List<PortfolioDto>();
        
        // In a real app, we'd bulk fetch prices. Here we loop (inefficient but simple for demo).
        // Better: Fetch top 50 prices once and pass down.
        var allPrices = await _cryptoService.GetTopAssetsAsync(100);

        foreach (var p in portfolios)
        {
            result.Add(MapToDto(p, allPrices.ToDictionary(k => k.Id, v => v.CurrentPrice)));
        }

        return result;
    }

    public async Task<PortfolioDto?> GetPortfolioAsync(Guid portfolioId, Guid userId)
    {
        var p = await _context.Portfolios
            .Include(p => p.Positions)
            .FirstOrDefaultAsync(x => x.Id == portfolioId && x.UserId == userId);

        if (p == null) return null;

        var allPrices = await _cryptoService.GetTopAssetsAsync(100);
        return MapToDto(p, allPrices.ToDictionary(k => k.Id, v => v.CurrentPrice));
    }

    public async Task<PortfolioDto> CreatePortfolioAsync(Guid userId, CreatePortfolioRequest request)
    {
        var portfolio = new Portfolio
        {
            UserId = userId,
            Name = request.Name,
            BalanceUsd = 10000m // Default starting cash
        };

        _context.Portfolios.Add(portfolio);
        await _context.SaveChangesAsync();

        return MapToDto(portfolio, new Dictionary<string, decimal>());
    }

    public async Task<PortfolioDto> ExecuteOrderAsync(Guid userId, Guid portfolioId, OrderRequest request, string type)
    {
        // Transactional logic
        var supportsTransactions = _context.Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory";
        Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction? transaction = null;
        if (supportsTransactions)
        {
            transaction = await _context.Database.BeginTransactionAsync();
        }

        try
        {
            var portfolio = await _context.Portfolios
                .Include(p => p.Positions)
                .FirstOrDefaultAsync(p => p.Id == portfolioId && p.UserId == userId);

            if (portfolio == null) throw new Exception("Portfolio not found");

            // Get Real Price
            var assetPriceDto = await _cryptoService.GetAssetAsync(request.AssetId);
            if (assetPriceDto == null) throw new Exception("Asset price unavailable");
            
            decimal price = assetPriceDto.CurrentPrice;
            decimal totalValue = price * request.Quantity;

            if (type == "Buy")
            {
                if (portfolio.BalanceUsd < totalValue) throw new Exception("Insufficient funds");
                
                portfolio.BalanceUsd -= totalValue;
                
                var position = portfolio.Positions.FirstOrDefault(p => p.AssetId == request.AssetId);
                if (position == null)
                {
                    position = new PortfolioPosition { PortfolioId = portfolio.Id, AssetId = request.AssetId, Quantity = 0, AverageBuyPrice = 0 };
                    portfolio.Positions.Add(position);
                }

                // Update Average Price
                // New Avg = ((OldQty * OldAvg) + (NewQty * NewPrice)) / TotalQty
                decimal totalCost = (position.Quantity * position.AverageBuyPrice) + totalValue;
                position.Quantity += request.Quantity;
                position.AverageBuyPrice = totalCost / position.Quantity;
            }
            else if (type == "Sell")
            {
                var position = portfolio.Positions.FirstOrDefault(p => p.AssetId == request.AssetId);
                if (position == null || position.Quantity < request.Quantity) throw new Exception("Insufficient holdings");

                portfolio.BalanceUsd += totalValue;
                position.Quantity -= request.Quantity;

                if (position.Quantity == 0)
                {
                    _context.PortfolioPositions.Remove(position);
                }
            }
            else
            {
                throw new Exception("Invalid order type");
            }

            // Record Transaction
            var trade = new Transaction
            {
                PortfolioId = portfolio.Id,
                AssetId = request.AssetId,
                Type = type,
                Quantity = request.Quantity,
                PriceAtTransaction = price,
                TotalUsd = totalValue
            };
            _context.Transactions.Add(trade);

            await _context.SaveChangesAsync();
            if (transaction != null)
            {
                await transaction.CommitAsync();
            }

            var allPrices = await _cryptoService.GetTopAssetsAsync(100);
            return MapToDto(portfolio, allPrices.ToDictionary(k => k.Id, v => v.CurrentPrice));
        }
        catch
        {
            if (transaction != null)
            {
                await transaction.RollbackAsync();
            }
            throw;
        }
    }

    public async Task<List<TransactionDto>> GetTransactionsAsync(Guid userId, Guid portfolioId)
    {
        var hasAccess = await _context.Portfolios.AnyAsync(p => p.Id == portfolioId && p.UserId == userId);
        if (!hasAccess) throw new Exception("Portfolio not found");

        return await _context.Transactions
            .Where(t => t.PortfolioId == portfolioId)
            .OrderByDescending(t => t.Timestamp)
            .Select(t => new TransactionDto
            {
                Id = t.Id,
                AssetId = t.AssetId,
                Type = t.Type,
                Quantity = t.Quantity,
                PriceAtTransaction = t.PriceAtTransaction,
                TotalUsd = t.TotalUsd,
                Timestamp = t.Timestamp
            })
            .ToListAsync();
    }

    private PortfolioDto MapToDto(Portfolio p, Dictionary<string, decimal> prices)
    {
        var dto = new PortfolioDto
        {
            Id = p.Id,
            Name = p.Name,
            BalanceUsd = p.BalanceUsd,
            Positions = new List<PortfolioPositionDto>()
        };

        decimal holdingsValue = 0;

        foreach (var pos in p.Positions)
        {
            decimal currentPrice = prices.GetValueOrDefault(pos.AssetId, pos.AverageBuyPrice); // Fallback if not in cache
            decimal currentValue = pos.Quantity * currentPrice;
            decimal costBasis = pos.Quantity * pos.AverageBuyPrice;
            
            holdingsValue += currentValue;

            dto.Positions.Add(new PortfolioPositionDto
            {
                AssetId = pos.AssetId,
                Quantity = pos.Quantity,
                AverageBuyPrice = pos.AverageBuyPrice,
                CurrentPrice = currentPrice,
                CurrentValue = currentValue,
                ProfitLoss = currentValue - costBasis,
                ProfitLossPercentage = costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0
            });
        }

        dto.TotalValueUsd = dto.BalanceUsd + holdingsValue;
        return dto;
    }
}
