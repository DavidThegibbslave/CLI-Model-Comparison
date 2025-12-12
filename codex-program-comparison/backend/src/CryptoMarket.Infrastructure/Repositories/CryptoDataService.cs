using CryptoMarket.Application.Services;
using CryptoMarket.Domain.Entities;
using CryptoMarket.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CryptoMarket.Infrastructure.Repositories;

public class CryptoDataService : ICryptoDataService
{
    private readonly AppDbContext _dbContext;

    public CryptoDataService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<CryptoAsset>> GetTopAssetsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.CryptoAssets
            .OrderBy(a => a.Symbol)
            .Take(50)
            .ToListAsync(cancellationToken);
    }
}
