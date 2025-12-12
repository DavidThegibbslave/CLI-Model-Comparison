using System.Text.Json.Serialization;

namespace CryptoMarket.Infrastructure.ExternalServices.CoinGecko.Models;

public class CoinGeckoMarketResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("symbol")]
    public string Symbol { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("image")]
    public string Image { get; set; } = string.Empty;

    [JsonPropertyName("current_price")]
    public decimal CurrentPrice { get; set; }

    [JsonPropertyName("market_cap")]
    public decimal MarketCap { get; set; }

    [JsonPropertyName("market_cap_rank")]
    public int MarketCapRank { get; set; }

    [JsonPropertyName("total_volume")]
    public decimal TotalVolume { get; set; }

    [JsonPropertyName("price_change_24h")]
    public decimal PriceChange24h { get; set; }

    [JsonPropertyName("price_change_percentage_24h")]
    public decimal PriceChangePercentage24h { get; set; }

    [JsonPropertyName("circulating_supply")]
    public decimal CirculatingSupply { get; set; }

    [JsonPropertyName("total_supply")]
    public decimal? TotalSupply { get; set; }

    [JsonPropertyName("high_24h")]
    public decimal High24h { get; set; }

    [JsonPropertyName("low_24h")]
    public decimal Low24h { get; set; }

    [JsonPropertyName("last_updated")]
    public DateTime LastUpdated { get; set; }
}
