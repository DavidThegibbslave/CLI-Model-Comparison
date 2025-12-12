using CryptoMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CryptoMarket.Infrastructure.Data.Configurations;

public class CryptoHoldingConfiguration : IEntityTypeConfiguration<CryptoHolding>
{
    public void Configure(EntityTypeBuilder<CryptoHolding> builder)
    {
        builder.ToTable("CryptoHoldings");

        builder.HasKey(h => h.Id);

        builder.Property(h => h.CryptoId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(h => h.Symbol)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(h => h.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(h => h.Amount)
            .IsRequired()
            .HasColumnType("decimal(18,8)");

        builder.Property(h => h.AveragePurchasePrice)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(h => h.FirstPurchaseDate)
            .IsRequired();

        builder.Property(h => h.LastUpdated)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(h => new { h.PortfolioId, h.CryptoId })
            .IsUnique();
    }
}
