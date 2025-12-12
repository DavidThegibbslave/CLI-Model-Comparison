using CryptoMarket.Application.DTOs.Crypto;
using CryptoMarket.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace CryptoMarket.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class CryptoController : ControllerBase
{
    private readonly ICryptoService _cryptoService;
    private readonly ILogger<CryptoController> _logger;

    public CryptoController(ICryptoService cryptoService, ILogger<CryptoController> logger)
    {
        _cryptoService = cryptoService;
        _logger = logger;
    }

    [HttpGet("markets")]
    [ProducesResponseType(typeof(List<CryptoMarketDto>), 200)]
    public async Task<ActionResult<List<CryptoMarketDto>>> GetMarkets(
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 50,
        [FromQuery] string sortBy = "market_cap",
        [FromQuery] string sortOrder = "desc")
    {
        try
        {
            var result = await _cryptoService.GetMarketsAsync(page, perPage, sortBy, sortOrder);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching markets");
            return StatusCode(500, new { error = "Failed to fetch market data" });
        }
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CryptoDetailDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<CryptoDetailDto>> GetCryptoDetail(string id)
    {
        try
        {
            var result = await _cryptoService.GetCryptoDetailAsync(id);

            if (result == null)
            {
                return NotFound(new { error = $"Cryptocurrency '{id}' not found" });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching crypto detail for {Id}", id);
            return StatusCode(500, new { error = "Failed to fetch cryptocurrency details" });
        }
    }

    [HttpGet("{id}/history")]
    [ProducesResponseType(typeof(PriceHistoryDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<PriceHistoryDto>> GetPriceHistory(string id, [FromQuery] int days = 7)
    {
        try
        {
            var result = await _cryptoService.GetPriceHistoryAsync(id, days);

            if (result == null)
            {
                return NotFound(new { error = $"Price history for '{id}' not found" });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching price history for {Id}", id);
            return StatusCode(500, new { error = "Failed to fetch price history" });
        }
    }

    [HttpGet("compare")]
    [ProducesResponseType(typeof(List<CryptoMarketDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<List<CryptoMarketDto>>> CompareCryptos([FromQuery] string ids)
    {
        if (string.IsNullOrWhiteSpace(ids))
        {
            return BadRequest(new { error = "IDs parameter is required" });
        }

        try
        {
            var result = await _cryptoService.CompareCryptosAsync(ids);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error comparing cryptos");
            return StatusCode(500, new { error = "Failed to compare cryptocurrencies" });
        }
    }

    [HttpGet("top")]
    [ProducesResponseType(typeof(List<CryptoMarketDto>), 200)]
    public async Task<ActionResult<List<CryptoMarketDto>>> GetTopGainersLosers([FromQuery] int limit = 10)
    {
        try
        {
            var result = await _cryptoService.GetTopGainersLosersAsync(limit);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching top gainers/losers");
            return StatusCode(500, new { error = "Failed to fetch top cryptocurrencies" });
        }
    }
}
