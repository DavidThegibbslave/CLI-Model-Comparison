using CryptoMarket.Infrastructure.BackgroundJobs;
using CryptoMarket.Web.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace CryptoMarket.Web.Services;

public class HubBroadcaster : IHubBroadcaster
{
    private readonly IHubContext<PriceUpdateHub> _hubContext;
    private readonly ILogger<HubBroadcaster> _logger;

    public HubBroadcaster(IHubContext<PriceUpdateHub> hubContext, ILogger<HubBroadcaster> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task BroadcastPriceUpdate(object priceUpdate, CancellationToken cancellationToken = default)
    {
        try
        {
            await _hubContext.Clients.All.SendAsync("ReceivePriceUpdate", priceUpdate, cancellationToken);
            _logger.LogTrace("Price update broadcasted to all SignalR clients");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast price update");
            throw;
        }
    }
}
