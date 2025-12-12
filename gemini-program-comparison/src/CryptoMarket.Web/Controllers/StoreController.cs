using CryptoMarket.Application.DTOs.Store;
using CryptoMarket.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CryptoMarket.Web.Controllers;

[ApiController]
[Route("api/store")]
public class StoreController : ControllerBase
{
    private static readonly Guid DemoUserId = Guid.Parse("00000000-0000-0000-0000-000000000042");
    private readonly IStoreService _storeService;

    public StoreController(IStoreService storeService)
    {
        _storeService = storeService;
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts()
    {
        var products = await _storeService.GetProductsAsync();
        return Ok(products);
    }

    [HttpGet("products/{id}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var product = await _storeService.GetProductAsync(id);
        if (product == null) return NotFound();
        return Ok(product);
    }

    [HttpGet("cart")]
    public async Task<IActionResult> GetCart()
    {
        var userId = GetUserId();
        var cart = await _storeService.GetCartAsync(userId);
        return Ok(cart);
    }

    [HttpPost("cart/items")]
    public async Task<IActionResult> AddToCart(AddToCartRequest request)
    {
        var userId = GetUserId();
        try 
        {
            await _storeService.AddToCartAsync(userId, request);
            return CreatedAtAction(nameof(GetCart), null);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("cart/items/{itemId}")]
    public async Task<IActionResult> RemoveFromCart(Guid itemId)
    {
        var userId = GetUserId();
        await _storeService.RemoveFromCartAsync(userId, itemId);
        return NoContent();
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout()
    {
        var userId = GetUserId();
        await _storeService.CheckoutAsync(userId);
        return Ok(new { message = "Checkout successful! (Visual demo only)" });
    }

    private Guid GetUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (idClaim == null) return DemoUserId;
        return Guid.Parse(idClaim.Value);
    }
}
