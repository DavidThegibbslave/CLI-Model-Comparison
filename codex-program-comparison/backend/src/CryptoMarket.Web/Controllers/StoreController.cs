using CryptoMarket.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CryptoMarket.Web.Controllers;

[ApiController]
[Route("api/store")]
public class StoreController : ControllerBase
{
    private readonly IStoreService _storeService;

    public StoreController(IStoreService storeService)
    {
        _storeService = storeService;
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts(CancellationToken cancellationToken)
    {
        var products = await _storeService.GetProductsAsync(cancellationToken);
        return Ok(products);
    }

    [HttpGet("products/{id}")]
    public async Task<IActionResult> GetProduct(Guid id, CancellationToken cancellationToken)
    {
        var product = await _storeService.GetProductAsync(id, cancellationToken);
        if (product == null)
        {
            return NotFound();
        }
        return Ok(product);
    }
}
