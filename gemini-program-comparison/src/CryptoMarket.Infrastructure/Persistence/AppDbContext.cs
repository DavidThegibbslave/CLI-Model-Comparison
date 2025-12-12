using CryptoMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CryptoMarket.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Cart> Carts { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<Portfolio> Portfolios { get; set; }
    public DbSet<PortfolioPosition> PortfolioPositions { get; set; }
    public DbSet<Transaction> Transactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
        });

        // Seed Products
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Name = "Bitcoin Hoodie", Description = "Comfortable cotton hoodie with BTC logo", Price = 49.99m, Category = "Apparel", ImageUrl = "https://placehold.co/400?text=BTC+Hoodie" },
            new Product { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Name = "Ethereum T-Shirt", Description = "Vitalik approved casual tee", Price = 24.99m, Category = "Apparel", ImageUrl = "https://placehold.co/400?text=ETH+Shirt" },
            new Product { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Name = "Hardware Wallet", Description = "Secure cold storage for your assets", Price = 129.00m, Category = "Electronics", ImageUrl = "https://placehold.co/400?text=Hardware+Wallet" },
            new Product { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), Name = "Crypto Mug", Description = "HODL your coffee", Price = 14.99m, Category = "Accessories", ImageUrl = "https://placehold.co/400?text=Mug" },
            new Product { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), Name = "Doge Plushie", Description = "Much wow, very soft", Price = 19.99m, Category = "Toys", ImageUrl = "https://placehold.co/400?text=Doge+Plushie" },
            new Product { Id = Guid.Parse("66666666-6666-6666-6666-666666666666"), Name = "Bitcoin Cap", Description = "Orange coin cap", Price = 19.99m, Category = "Apparel", ImageUrl = "https://placehold.co/400?text=Cap" },
            new Product { Id = Guid.Parse("77777777-7777-7777-7777-777777777777"), Name = "Mining Rig Case", Description = "Open air frame for GPU mining", Price = 89.99m, Category = "Electronics", ImageUrl = "https://placehold.co/400?text=Mining+Frame" },
            new Product { Id = Guid.Parse("88888888-8888-8888-8888-888888888888"), Name = "Stickers Pack", Description = "Crypto logos for your laptop", Price = 9.99m, Category = "Accessories", ImageUrl = "https://placehold.co/400?text=Stickers" },
            new Product { Id = Guid.Parse("99999999-9999-9999-9999-999999999999"), Name = "Solana Socks", Description = "Fast L1 speed for your feet", Price = 12.99m, Category = "Apparel", ImageUrl = "https://placehold.co/400?text=SOL+Socks" },
            new Product { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), Name = "Trading Desk Mat", Description = "Large mousepad with chart patterns", Price = 29.99m, Category = "Accessories", ImageUrl = "https://placehold.co/400?text=Desk+Mat" }
        );
    }
}