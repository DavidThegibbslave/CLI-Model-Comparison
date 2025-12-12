namespace CryptoMarket.Application.Options;

public class CryptoApiOptions
{
    public string Provider { get; set; } = "coingecko";
    public string BaseUrl { get; set; } = "https://api.coingecko.com/api/v3/";
    public string? ApiKey { get; set; }
    public string? ApiKeyHeader { get; set; } = "x-cg-demo-api-key";
    public int CacheSeconds { get; set; } = 30;
    public int PollSeconds { get; set; } = 30;
    public int TopLimit { get; set; } = 20;
}
