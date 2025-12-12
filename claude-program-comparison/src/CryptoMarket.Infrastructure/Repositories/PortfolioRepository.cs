using CryptoMarket.Application.Interfaces.Repositories;
using CryptoMarket.Domain.Entities;
using CryptoMarket.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CryptoMarket.Infrastructure.Repositories;

public class PortfolioRepository : IPortfolioRepository
{
    private readonly ApplicationDbContext _context;

    public PortfolioRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Portfolio?> GetByUserIdAsync(Guid userId)
    {
        return await _context.Portfolios
            .Include(p => p.Holdings)
            .Include(p => p.Transactions)
            .FirstOrDefaultAsync(p => p.UserId == userId);
    }

    public async Task<Portfolio?> GetByIdAsync(Guid portfolioId)
    {
        return await _context.Portfolios
            .Include(p => p.Holdings)
            .Include(p => p.Transactions)
            .FirstOrDefaultAsync(p => p.Id == portfolioId);
    }

    public async Task<Portfolio> CreateAsync(Portfolio portfolio)
    {
        _context.Portfolios.Add(portfolio);
        await _context.SaveChangesAsync();
        return portfolio;
    }

    public async Task<Portfolio> UpdateAsync(Portfolio portfolio)
    {
        portfolio.UpdatedAt = DateTime.UtcNow;
        _context.Portfolios.Update(portfolio);
        await _context.SaveChangesAsync();
        return portfolio;
    }
}
