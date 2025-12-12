using CryptoMarket.Application.DTOs.Store;
using CryptoMarket.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CryptoMarket.Web.Controllers;

[ApiController]
[Route("api/crypto")]
public class CryptoController : ControllerBase
{
    private readonly ICryptoService _cryptoService;

    public CryptoController(ICryptoService cryptoService)
    {
        _cryptoService = cryptoService;
    }

    [HttpGet]
    public IActionResult GetRoot()
    {
        return Ok("CryptoController is active");
    }

    [HttpGet("list")]
    public async Task<IActionResult> GetTopAssets([FromQuery] int limit = 20)
    {
        var assets = await _cryptoService.GetTopAssetsAsync(limit);
        return Ok(assets);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAsset(string id)
    {
        var asset = await _cryptoService.GetAssetAsync(id);
        if (asset == null) return NotFound();
        return Ok(asset);
    }

    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetHistory(string id, [FromQuery] int days = 7)
    {
        var history = await _cryptoService.GetAssetHistoryAsync(id, days);
        return Ok(history);
    }

    [HttpPost("compare")]
    public async Task<IActionResult> Compare([FromBody] CompareRequest request)
    {
        if (request.AssetIds == null || !request.AssetIds.Any())
        {
            return BadRequest("At least one asset ID is required.");
        }

        var data = await _cryptoService.CompareAssetsAsync(request.AssetIds);
        return Ok(data);
    }
}