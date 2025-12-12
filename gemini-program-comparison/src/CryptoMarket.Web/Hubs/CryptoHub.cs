using CryptoMarket.Application.DTOs.Market;
using Microsoft.AspNetCore.SignalR;

namespace CryptoMarket.Web.Hubs;

public class CryptoHub : Hub
{
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
    
    // Clients can join groups for specific crypto updates if needed in future
    public async Task JoinCryptoGroup(string symbol)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, symbol);
    }
}
