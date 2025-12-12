using CryptoMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CryptoMarket.Infrastructure.Data.Configurations;

public class PriceAlertConfiguration : IEntityTypeConfiguration<PriceAlert>
{
    public void Configure(EntityTypeBuilder<PriceAlert> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.CryptoId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Symbol)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.TargetPrice)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(p => p.IsAbove)
            .IsRequired();

        builder.Property(p => p.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(p => p.IsTriggered)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(p => p.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(p => p.TriggeredAt)
            .IsRequired(false);

        // Relationships
        builder.HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(p => p.UserId);
        builder.HasIndex(p => new { p.IsActive, p.IsTriggered });
        builder.HasIndex(p => p.CryptoId);
    }
}
