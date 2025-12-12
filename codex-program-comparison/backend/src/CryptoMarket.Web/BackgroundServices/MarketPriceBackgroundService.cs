using CryptoMarket.Application.Interfaces;
using CryptoMarket.Application.Options;
using CryptoMarket.Web.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CryptoMarket.Web.BackgroundServices;

public class MarketPriceBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly CryptoApiOptions _options;
    private readonly ILogger<MarketPriceBackgroundService> _logger;

    public MarketPriceBackgroundService(IServiceProvider serviceProvider, IOptions<CryptoApiOptions> options, ILogger<MarketPriceBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _options = options.Value;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var delay = TimeSpan.FromSeconds(Math.Clamp(_options.PollSeconds, 15, 120));
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var marketService = scope.ServiceProvider.GetRequiredService<ICryptoMarketService>();
                var hub = scope.ServiceProvider.GetRequiredService<IHubContext<MarketHub>>();

                var assets = await marketService.GetAssetsAsync(stoppingToken);
                await hub.Clients.All.SendAsync("prices", assets, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to broadcast prices");
            }

            try
            {
                await Task.Delay(delay, stoppingToken);
            }
            catch (TaskCanceledException)
            {
                break;
            }
        }
    }
}
