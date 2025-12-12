namespace CryptoMarket.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool MfaEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public string? PreferencesJson { get; set; }

    public ICollection<Role> Roles { get; set; } = new List<Role>();
    public ICollection<Cart> Carts { get; set; } = new List<Cart>();
    public ICollection<Portfolio> Portfolios { get; set; } = new List<Portfolio>();
    public ICollection<AlertRule> Alerts { get; set; } = new List<AlertRule>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
