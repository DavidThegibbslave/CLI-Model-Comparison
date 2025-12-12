using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CryptoMarket.Web.Hubs;

[Authorize]
public class MarketHub : Hub
{
    // Clients subscribe to receive broadcasts such as "prices" from background workers.
}
