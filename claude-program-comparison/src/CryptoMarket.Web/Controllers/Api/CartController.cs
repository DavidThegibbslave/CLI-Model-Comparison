using System.Security.Claims;
using CryptoMarket.Application.DTOs.Store;
using CryptoMarket.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CryptoMarket.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;
    private readonly ILogger<CartController> _logger;

    public CartController(ICartService cartService, ILogger<CartController> logger)
    {
        _cartService = cartService;
        _logger = logger;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return userId;
    }

    [HttpGet]
    [ProducesResponseType(typeof(CartDto), 200)]
    public async Task<ActionResult<CartDto>> GetCart()
    {
        try
        {
            var userId = GetUserId();
            var cart = await _cartService.GetCartAsync(userId);
            return Ok(cart);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching cart");
            return StatusCode(500, new { error = "Failed to fetch cart" });
        }
    }

    [HttpPost("items")]
    [ProducesResponseType(typeof(CartDto), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<CartDto>> AddToCart([FromBody] AddToCartDto addToCartDto)
    {
        if (string.IsNullOrWhiteSpace(addToCartDto.CryptoId))
        {
            return BadRequest(new { error = "CryptoId is required" });
        }

        if (addToCartDto.Amount <= 0)
        {
            return BadRequest(new { error = "Amount must be greater than 0" });
        }

        try
        {
            var userId = GetUserId();
            var cart = await _cartService.AddToCartAsync(userId, addToCartDto);
            return Ok(cart);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when adding to cart");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding to cart");
            return StatusCode(500, new { error = "Failed to add item to cart" });
        }
    }

    [HttpPut("items/{cartItemId}")]
    [ProducesResponseType(typeof(CartDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<CartDto>> UpdateCartItem(Guid cartItemId, [FromBody] UpdateCartItemDto updateDto)
    {
        if (updateDto.Amount <= 0)
        {
            return BadRequest(new { error = "Amount must be greater than 0" });
        }

        try
        {
            var userId = GetUserId();
            var cart = await _cartService.UpdateCartItemAsync(userId, cartItemId, updateDto);
            return Ok(cart);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when updating cart item");
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating cart item {CartItemId}", cartItemId);
            return StatusCode(500, new { error = "Failed to update cart item" });
        }
    }

    [HttpDelete("items/{cartItemId}")]
    [ProducesResponseType(typeof(CartDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<CartDto>> RemoveFromCart(Guid cartItemId)
    {
        try
        {
            var userId = GetUserId();
            var cart = await _cartService.RemoveFromCartAsync(userId, cartItemId);
            return Ok(cart);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when removing from cart");
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cart item {CartItemId}", cartItemId);
            return StatusCode(500, new { error = "Failed to remove item from cart" });
        }
    }

    [HttpDelete]
    [ProducesResponseType(typeof(CartDto), 200)]
    public async Task<ActionResult<CartDto>> ClearCart()
    {
        try
        {
            var userId = GetUserId();
            var cart = await _cartService.ClearCartAsync(userId);
            return Ok(cart);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing cart");
            return StatusCode(500, new { error = "Failed to clear cart" });
        }
    }

    [HttpPost("checkout")]
    [ProducesResponseType(typeof(CheckoutResultDto), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<CheckoutResultDto>> Checkout()
    {
        try
        {
            var userId = GetUserId();
            var result = await _cartService.CheckoutAsync(userId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation during checkout");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during checkout");
            return StatusCode(500, new { error = "Failed to complete checkout" });
        }
    }
}
