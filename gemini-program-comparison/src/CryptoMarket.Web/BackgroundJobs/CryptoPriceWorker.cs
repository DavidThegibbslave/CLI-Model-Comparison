using CryptoMarket.Application.Interfaces;
using CryptoMarket.Web.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CryptoMarket.Web.BackgroundJobs;

public class CryptoPriceWorker : BackgroundService
{
    private readonly IHubContext<CryptoHub> _hubContext;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CryptoPriceWorker> _logger;

    public CryptoPriceWorker(
        IHubContext<CryptoHub> hubContext, 
        IServiceProvider serviceProvider,
        ILogger<CryptoPriceWorker> logger)
    {
        _hubContext = hubContext;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("CryptoPriceWorker is starting.");

        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(60)); // Update every 60 seconds

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var cryptoService = scope.ServiceProvider.GetRequiredService<ICryptoService>();
                    _logger.LogInformation("CryptoPriceWorker: Attempting to fetch top assets.");
                    var prices = await cryptoService.GetTopAssetsAsync(20);

                    if (prices.Any())
                    {
                        _logger.LogInformation($"Broadcasting {prices.Count} prices to clients.");
                        await _hubContext.Clients.All.SendAsync("ReceivePrices", prices, stoppingToken);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CryptoPriceWorker");
            }
        }
    }
}
