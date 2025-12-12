using CryptoMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CryptoMarket.Infrastructure.Data.Configurations;

public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.ToTable("CartItems");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.CryptoId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(i => i.Symbol)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(i => i.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(i => i.Amount)
            .IsRequired()
            .HasColumnType("decimal(18,8)");

        builder.Property(i => i.PriceAtAdd)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(i => i.AddedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(i => i.CartId);
    }
}
