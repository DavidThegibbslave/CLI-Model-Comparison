using CryptoMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CryptoMarket.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<CryptoAsset> CryptoAssets => Set<CryptoAsset>();
    public DbSet<MarketSnapshot> MarketSnapshots => Set<MarketSnapshot>();
    public DbSet<PriceHistory> PriceHistories => Set<PriceHistory>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Portfolio> Portfolios => Set<Portfolio>();
    public DbSet<PortfolioPosition> PortfolioPositions => Set<PortfolioPosition>();
    public DbSet<AlertRule> AlertRules => Set<AlertRule>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Role>().HasIndex(r => r.Name).IsUnique();
        modelBuilder.Entity<CryptoAsset>().HasIndex(a => a.Symbol).IsUnique();
        modelBuilder.Entity<User>()
            .HasMany(u => u.Roles)
            .WithMany(r => r.Users);
        modelBuilder.Entity<Cart>()
            .HasMany(c => c.Items)
            .WithOne(i => i.Cart)
            .HasForeignKey(i => i.CartId);
        modelBuilder.Entity<Product>()
            .HasMany(p => p.CartItems)
            .WithOne(ci => ci.Product)
            .HasForeignKey(ci => ci.ProductId);
        modelBuilder.Entity<Portfolio>()
            .HasMany(p => p.Positions)
            .WithOne(pos => pos.Portfolio)
            .HasForeignKey(pos => pos.PortfolioId);
        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.TokenHash)
            .IsUnique();
        modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.UserId);
    }
}
