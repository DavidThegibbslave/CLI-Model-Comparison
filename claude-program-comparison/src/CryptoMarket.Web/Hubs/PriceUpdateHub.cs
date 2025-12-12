using Microsoft.AspNetCore.SignalR;

namespace CryptoMarket.Web.Hubs;

public class PriceUpdateHub : Hub
{
    private readonly ILogger<PriceUpdateHub> _logger;

    public PriceUpdateHub(ILogger<PriceUpdateHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SubscribeToPrice(string cryptoId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"crypto_{cryptoId}");
        _logger.LogInformation("Client {ConnectionId} subscribed to {CryptoId}", Context.ConnectionId, cryptoId);
    }

    public async Task UnsubscribeFromPrice(string cryptoId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"crypto_{cryptoId}");
        _logger.LogInformation("Client {ConnectionId} unsubscribed from {CryptoId}", Context.ConnectionId, cryptoId);
    }
}
