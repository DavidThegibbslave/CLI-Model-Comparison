using CryptoMarket.Application.Interfaces.Repositories;
using CryptoMarket.Domain.Entities;
using CryptoMarket.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CryptoMarket.Infrastructure.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly ApplicationDbContext _context;

    public TransactionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Transaction?> GetByIdAsync(Guid transactionId)
    {
        return await _context.Transactions.FindAsync(transactionId);
    }

    public async Task<List<Transaction>> GetByPortfolioIdAsync(Guid portfolioId, int page = 1, int pageSize = 20)
    {
        return await _context.Transactions
            .Where(t => t.PortfolioId == portfolioId)
            .OrderByDescending(t => t.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<Transaction> CreateAsync(Transaction transaction)
    {
        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();
        return transaction;
    }

    public async Task<int> CountByPortfolioIdAsync(Guid portfolioId)
    {
        return await _context.Transactions
            .CountAsync(t => t.PortfolioId == portfolioId);
    }
}
