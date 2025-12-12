using CryptoMarket.Application.Interfaces.Repositories;
using CryptoMarket.Domain.Entities;
using CryptoMarket.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CryptoMarket.Infrastructure.Repositories;

public class CryptoHoldingRepository : ICryptoHoldingRepository
{
    private readonly ApplicationDbContext _context;

    public CryptoHoldingRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CryptoHolding?> GetByIdAsync(Guid holdingId)
    {
        return await _context.CryptoHoldings.FindAsync(holdingId);
    }

    public async Task<CryptoHolding?> GetByPortfolioAndCryptoAsync(Guid portfolioId, string cryptoId)
    {
        return await _context.CryptoHoldings
            .FirstOrDefaultAsync(h => h.PortfolioId == portfolioId && h.CryptoId == cryptoId);
    }

    public async Task<List<CryptoHolding>> GetByPortfolioIdAsync(Guid portfolioId)
    {
        return await _context.CryptoHoldings
            .Where(h => h.PortfolioId == portfolioId)
            .OrderByDescending(h => h.Amount)
            .ToListAsync();
    }

    public async Task<CryptoHolding> CreateAsync(CryptoHolding holding)
    {
        _context.CryptoHoldings.Add(holding);
        await _context.SaveChangesAsync();
        return holding;
    }

    public async Task<CryptoHolding> UpdateAsync(CryptoHolding holding)
    {
        _context.CryptoHoldings.Update(holding);
        await _context.SaveChangesAsync();
        return holding;
    }

    public async Task DeleteAsync(Guid holdingId)
    {
        var holding = await _context.CryptoHoldings.FindAsync(holdingId);
        if (holding != null)
        {
            _context.CryptoHoldings.Remove(holding);
            await _context.SaveChangesAsync();
        }
    }
}
