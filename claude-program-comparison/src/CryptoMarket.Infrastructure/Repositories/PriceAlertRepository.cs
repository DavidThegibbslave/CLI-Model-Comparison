using CryptoMarket.Application.Interfaces.Repositories;
using CryptoMarket.Domain.Entities;
using CryptoMarket.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CryptoMarket.Infrastructure.Repositories;

public class PriceAlertRepository : IPriceAlertRepository
{
    private readonly ApplicationDbContext _context;

    public PriceAlertRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PriceAlert?> GetByIdAsync(Guid id)
    {
        return await _context.PriceAlerts
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<List<PriceAlert>> GetByUserIdAsync(Guid userId)
    {
        return await _context.PriceAlerts
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<PriceAlert>> GetActiveAlertsAsync()
    {
        return await _context.PriceAlerts
            .Where(a => a.IsActive && !a.IsTriggered)
            .ToListAsync();
    }

    public async Task<PriceAlert> CreateAsync(PriceAlert alert)
    {
        _context.PriceAlerts.Add(alert);
        await _context.SaveChangesAsync();
        return alert;
    }

    public async Task UpdateAsync(PriceAlert alert)
    {
        _context.PriceAlerts.Update(alert);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var alert = await _context.PriceAlerts.FindAsync(id);
        if (alert != null)
        {
            _context.PriceAlerts.Remove(alert);
            await _context.SaveChangesAsync();
        }
    }
}
