namespace CryptoMarket.Domain.Entities;

public class Portfolio
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<CryptoHolding> Holdings { get; set; } = new List<CryptoHolding>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
