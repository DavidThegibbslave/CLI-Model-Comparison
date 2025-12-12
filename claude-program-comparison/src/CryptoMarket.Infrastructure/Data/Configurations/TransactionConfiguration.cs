using CryptoMarket.Domain.Entities;
using CryptoMarket.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CryptoMarket.Infrastructure.Data.Configurations;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.ToTable("Transactions");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.CryptoId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(t => t.Symbol)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(t => t.Type)
            .HasConversion<int>();

        builder.Property(t => t.Amount)
            .IsRequired()
            .HasColumnType("decimal(18,8)");

        builder.Property(t => t.PriceAtTransaction)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(t => t.TotalValue)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(t => t.Timestamp)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(t => t.PortfolioId);
        builder.HasIndex(t => t.Timestamp);
    }
}
