using CryptoMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CryptoMarket.Infrastructure.Data.Configurations;

public class PriceCacheConfiguration : IEntityTypeConfiguration<PriceCache>
{
    public void Configure(EntityTypeBuilder<PriceCache> builder)
    {
        builder.ToTable("PriceCaches");

        builder.HasKey(p => p.CryptoId);

        builder.Property(p => p.CryptoId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Symbol)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.CurrentPrice)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(p => p.MarketCap)
            .HasColumnType("decimal(18,2)");

        builder.Property(p => p.Volume24h)
            .HasColumnType("decimal(18,2)");

        builder.Property(p => p.PriceChange24h)
            .HasColumnType("decimal(18,2)");

        builder.Property(p => p.PriceChangePercentage24h)
            .HasColumnType("decimal(10,4)");

        builder.Property(p => p.LastUpdated)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(p => p.ImageUrl)
            .HasMaxLength(500);

        builder.HasIndex(p => p.LastUpdated);
    }
}
