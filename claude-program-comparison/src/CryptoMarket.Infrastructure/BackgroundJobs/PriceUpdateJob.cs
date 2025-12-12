using CryptoMarket.Application.Interfaces.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CryptoMarket.Infrastructure.BackgroundJobs;

// Interface for SignalR hub broadcasting to avoid circular dependency
public interface IHubBroadcaster
{
    Task BroadcastPriceUpdate(object priceUpdate, CancellationToken cancellationToken = default);
}

public class PriceUpdateJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PriceUpdateJob> _logger;
    private readonly IHubBroadcaster? _hubBroadcaster;

    public PriceUpdateJob(
        IServiceProvider serviceProvider,
        ILogger<PriceUpdateJob> logger,
        IHubBroadcaster? hubBroadcaster = null)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _hubBroadcaster = hubBroadcaster;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Price Update Background Job started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var cryptoService = scope.ServiceProvider.GetRequiredService<ICryptoService>();
                var alertService = scope.ServiceProvider.GetService<IPriceAlertService>();

                // Fetch top 50 cryptocurrencies
                var markets = await cryptoService.GetMarketsAsync(1, 50);

                if (markets.Any())
                {
                    _logger.LogInformation("Fetched {Count} cryptocurrency prices", markets.Count);

                    // Broadcast price updates to all connected clients via SignalR (if configured)
                    if (_hubBroadcaster != null)
                    {
                        try
                        {
                            var priceUpdate = new
                            {
                                timestamp = DateTime.UtcNow,
                                prices = markets.Select(m => new
                                {
                                    id = m.Id,
                                    symbol = m.Symbol,
                                    name = m.Name,
                                    currentPrice = m.CurrentPrice,
                                    priceChange24h = m.PriceChange24h,
                                    priceChangePercentage24h = m.PriceChangePercentage24h,
                                    marketCap = m.MarketCap,
                                    volume24h = m.Volume24h
                                }).ToList()
                            };

                            await _hubBroadcaster.BroadcastPriceUpdate(priceUpdate, stoppingToken);
                            _logger.LogDebug("Broadcasted price updates to SignalR clients");
                        }
                        catch (Exception hubEx)
                        {
                            _logger.LogWarning(hubEx, "Failed to broadcast price updates via SignalR");
                        }
                    }
                }

                // Check and trigger price alerts (if service is available)
                if (alertService != null)
                {
                    try
                    {
                        await alertService.CheckAndTriggerAlertsAsync();
                        _logger.LogDebug("Price alerts checked");
                    }
                    catch (Exception alertEx)
                    {
                        _logger.LogWarning(alertEx, "Failed to check price alerts");
                    }
                }

                // Wait 30 seconds before next update
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Price Update Background Job");
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }

        _logger.LogInformation("Price Update Background Job stopped");
    }
}
