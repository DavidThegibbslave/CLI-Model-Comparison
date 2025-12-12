namespace CryptoMarket.Application.Options;

public class AuthTokenOptions
{
    public string Issuer { get; set; } = "CryptoMarket";
    public string Audience { get; set; } = "CryptoMarketAudience";
    public string Key { get; set; } = "change-me";
    public int AccessTokenMinutes { get; set; } = 15;
    public int RefreshTokenDays { get; set; } = 7;
}
