using System.Security.Claims;
using CryptoMarket.Application.DTOs.Store;
using CryptoMarket.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CryptoMarket.Web.Controllers;

[ApiController]
[Authorize]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private readonly IStoreService _storeService;

    public CartController(IStoreService storeService)
    {
        _storeService = storeService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        var cart = await _storeService.GetCartAsync(userId, cancellationToken);
        return Ok(cart);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddCartItemRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        var cart = await _storeService.AddItemAsync(userId, request, cancellationToken);
        return Created($"/api/cart", cart);
    }

    [HttpDelete("items/{id}")]
    public async Task<IActionResult> RemoveItem(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        var cart = await _storeService.RemoveItemAsync(userId, id, cancellationToken);
        return Ok(cart);
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        var result = await _storeService.CheckoutAsync(userId, cancellationToken);
        return Ok(result);
    }

    private Guid GetUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(idClaim, out var id) ? id : Guid.Empty;
    }
}
