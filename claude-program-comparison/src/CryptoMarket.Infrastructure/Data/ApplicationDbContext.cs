using CryptoMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CryptoMarket.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Portfolio> Portfolios => Set<Portfolio>();
    public DbSet<CryptoHolding> CryptoHoldings => Set<CryptoHolding>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<PriceCache> PriceCaches => Set<PriceCache>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PriceAlert> PriceAlerts => Set<PriceAlert>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations from the current assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
