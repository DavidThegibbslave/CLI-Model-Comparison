using CryptoMarket.Application.DTOs.Crypto;
using CryptoMarket.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CryptoMarket.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CryptoController : ControllerBase
{
    private readonly ICryptoMarketService _marketService;

    public CryptoController(ICryptoMarketService marketService)
    {
        _marketService = marketService;
    }

    [HttpGet("list")]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        var assets = await _marketService.GetAssetsAsync(cancellationToken);
        return Ok(assets);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id, CancellationToken cancellationToken)
    {
        var asset = await _marketService.GetAssetAsync(id, cancellationToken);
        if (asset == null)
        {
            return NotFound();
        }
        return Ok(asset);
    }

    [HttpGet("{id}/history")]
    public async Task<IActionResult> History(string id, [FromQuery] string days = "1", CancellationToken cancellationToken = default)
    {
        var history = await _marketService.GetHistoryAsync(id, days, cancellationToken);
        return Ok(history);
    }

    [HttpGet("top")]
    public async Task<IActionResult> Top(CancellationToken cancellationToken)
    {
        var top = await _marketService.GetTopMoversAsync(cancellationToken);
        return Ok(top);
    }

    [HttpPost("compare")]
    public async Task<IActionResult> Compare([FromBody] CompareRequest request, CancellationToken cancellationToken)
    {
        if (request.AssetIds == null || request.AssetIds.Count < 2)
        {
            return BadRequest(new { message = "Provide at least two assetIds." });
        }

        var result = await _marketService.CompareAsync(request.AssetIds, cancellationToken);
        return Ok(result);
    }
}
