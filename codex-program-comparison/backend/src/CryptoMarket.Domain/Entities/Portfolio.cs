namespace CryptoMarket.Domain.Entities;

public class Portfolio
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = "Default";
    public string RiskTolerance { get; set; } = "medium";

    public User? User { get; set; }
    public ICollection<PortfolioPosition> Positions { get; set; } = new List<PortfolioPosition>();
}
