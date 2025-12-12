using CryptoMarket.Application.DTOs.Portfolio;
using CryptoMarket.Application.Interfaces.Repositories;
using CryptoMarket.Application.Interfaces.Services;
using Microsoft.Extensions.Logging;

namespace CryptoMarket.Application.Services;

public class PortfolioService : IPortfolioService
{
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly ICryptoHoldingRepository _holdingRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly ICryptoService _cryptoService;
    private readonly ILogger<PortfolioService> _logger;

    public PortfolioService(
        IPortfolioRepository portfolioRepository,
        ICryptoHoldingRepository holdingRepository,
        ITransactionRepository transactionRepository,
        ICryptoService cryptoService,
        ILogger<PortfolioService> logger)
    {
        _portfolioRepository = portfolioRepository;
        _holdingRepository = holdingRepository;
        _transactionRepository = transactionRepository;
        _cryptoService = cryptoService;
        _logger = logger;
    }

    public async Task<PortfolioDto> GetPortfolioAsync(Guid userId)
    {
        var portfolio = await _portfolioRepository.GetByUserIdAsync(userId);

        if (portfolio == null)
        {
            throw new InvalidOperationException("Portfolio not found for user");
        }

        var holdings = await _holdingRepository.GetByPortfolioIdAsync(portfolio.Id);

        var portfolioDto = new PortfolioDto
        {
            Id = portfolio.Id,
            UserId = portfolio.UserId,
            CreatedAt = portfolio.CreatedAt,
            UpdatedAt = portfolio.UpdatedAt,
            Holdings = new List<CryptoHoldingDto>()
        };

        decimal totalValue = 0;
        decimal totalInvested = 0;

        foreach (var holding in holdings)
        {
            // Fetch current price
            var cryptoDetail = await _cryptoService.GetCryptoDetailAsync(holding.CryptoId);
            var currentPrice = cryptoDetail?.CurrentPrice ?? holding.AveragePurchasePrice;

            var holdingDto = new CryptoHoldingDto
            {
                Id = holding.Id,
                CryptoId = holding.CryptoId,
                Symbol = holding.Symbol,
                Name = holding.Name,
                Amount = holding.Amount,
                AverageBuyPrice = holding.AveragePurchasePrice,
                CurrentPrice = currentPrice,
                FirstPurchaseDate = holding.FirstPurchaseDate,
                LastUpdated = DateTime.UtcNow
            };

            portfolioDto.Holdings.Add(holdingDto);

            totalValue += holdingDto.CurrentValue;
            totalInvested += holdingDto.TotalInvested;
        }

        portfolioDto.TotalValue = totalValue;
        portfolioDto.TotalInvested = totalInvested;

        return portfolioDto;
    }

    public async Task<List<TransactionDto>> GetTransactionsAsync(Guid userId, int page = 1, int pageSize = 20)
    {
        var portfolio = await _portfolioRepository.GetByUserIdAsync(userId);

        if (portfolio == null)
        {
            throw new InvalidOperationException("Portfolio not found for user");
        }

        var transactions = await _transactionRepository.GetByPortfolioIdAsync(portfolio.Id, page, pageSize);

        return transactions.Select(t => new TransactionDto
        {
            Id = t.Id,
            CryptoId = t.CryptoId,
            Symbol = t.Symbol,
            Name = string.Empty, // Transaction entity doesn't have Name property
            Type = t.Type,
            Amount = t.Amount,
            PriceAtTransaction = t.PriceAtTransaction,
            TransactionDate = t.Timestamp
        }).ToList();
    }

    public async Task<PortfolioPerformanceDto> GetPerformanceAsync(Guid userId)
    {
        var portfolio = await _portfolioRepository.GetByUserIdAsync(userId);

        if (portfolio == null)
        {
            throw new InvalidOperationException("Portfolio not found for user");
        }

        var holdings = await _holdingRepository.GetByPortfolioIdAsync(portfolio.Id);
        var transactionCount = await _transactionRepository.CountByPortfolioIdAsync(portfolio.Id);

        var performance = new PortfolioPerformanceDto
        {
            TotalHoldings = holdings.Count,
            TotalTransactions = transactionCount,
            Allocations = new List<HoldingAllocationDto>()
        };

        decimal totalValue = 0;
        decimal totalInvested = 0;
        var holdingDtos = new List<CryptoHoldingDto>();

        foreach (var holding in holdings)
        {
            // Fetch current price
            var cryptoDetail = await _cryptoService.GetCryptoDetailAsync(holding.CryptoId);
            var currentPrice = cryptoDetail?.CurrentPrice ?? holding.AveragePurchasePrice;

            var holdingDto = new CryptoHoldingDto
            {
                Id = holding.Id,
                CryptoId = holding.CryptoId,
                Symbol = holding.Symbol,
                Name = holding.Name,
                Amount = holding.Amount,
                AverageBuyPrice = holding.AveragePurchasePrice,
                CurrentPrice = currentPrice,
                FirstPurchaseDate = holding.FirstPurchaseDate,
                LastUpdated = DateTime.UtcNow
            };

            holdingDtos.Add(holdingDto);

            totalValue += holdingDto.CurrentValue;
            totalInvested += holdingDto.TotalInvested;
        }

        performance.TotalValue = totalValue;
        performance.TotalInvested = totalInvested;
        performance.TotalProfitLoss = totalValue - totalInvested;
        performance.TotalProfitLossPercentage = totalInvested > 0 ? (performance.TotalProfitLoss / totalInvested) * 100 : 0;

        // Find best and worst performers
        if (holdingDtos.Any())
        {
            performance.BestPerformer = holdingDtos.OrderByDescending(h => h.ProfitLossPercentage).FirstOrDefault();
            performance.WorstPerformer = holdingDtos.OrderBy(h => h.ProfitLossPercentage).FirstOrDefault();
        }

        // Calculate allocations
        foreach (var holdingDto in holdingDtos)
        {
            performance.Allocations.Add(new HoldingAllocationDto
            {
                CryptoId = holdingDto.CryptoId,
                Symbol = holdingDto.Symbol,
                Name = holdingDto.Name,
                Value = holdingDto.CurrentValue,
                Percentage = totalValue > 0 ? (holdingDto.CurrentValue / totalValue) * 100 : 0
            });
        }

        return performance;
    }

    public async Task<CryptoHoldingDto?> GetHoldingAsync(Guid userId, string cryptoId)
    {
        var portfolio = await _portfolioRepository.GetByUserIdAsync(userId);

        if (portfolio == null)
        {
            throw new InvalidOperationException("Portfolio not found for user");
        }

        var holding = await _holdingRepository.GetByPortfolioAndCryptoAsync(portfolio.Id, cryptoId);

        if (holding == null)
        {
            return null;
        }

        // Fetch current price
        var cryptoDetail = await _cryptoService.GetCryptoDetailAsync(holding.CryptoId);
        var currentPrice = cryptoDetail?.CurrentPrice ?? holding.AveragePurchasePrice;

        return new CryptoHoldingDto
        {
            Id = holding.Id,
            CryptoId = holding.CryptoId,
            Symbol = holding.Symbol,
            Name = holding.Name,
            Amount = holding.Amount,
            AverageBuyPrice = holding.AveragePurchasePrice,
            CurrentPrice = currentPrice,
            FirstPurchaseDate = holding.FirstPurchaseDate,
            LastUpdated = DateTime.UtcNow
        };
    }
}
