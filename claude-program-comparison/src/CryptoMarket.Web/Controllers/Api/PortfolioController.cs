using System.Security.Claims;
using CryptoMarket.Application.DTOs.Portfolio;
using CryptoMarket.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CryptoMarket.Web.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PortfolioController : ControllerBase
{
    private readonly IPortfolioService _portfolioService;
    private readonly ILogger<PortfolioController> _logger;

    public PortfolioController(IPortfolioService portfolioService, ILogger<PortfolioController> logger)
    {
        _portfolioService = portfolioService;
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
    [ProducesResponseType(typeof(PortfolioDto), 200)]
    public async Task<ActionResult<PortfolioDto>> GetPortfolio()
    {
        try
        {
            var userId = GetUserId();
            var portfolio = await _portfolioService.GetPortfolioAsync(userId);
            return Ok(portfolio);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when fetching portfolio");
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching portfolio");
            return StatusCode(500, new { error = "Failed to fetch portfolio" });
        }
    }

    [HttpGet("transactions")]
    [ProducesResponseType(typeof(List<TransactionDto>), 200)]
    public async Task<ActionResult<List<TransactionDto>>> GetTransactions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (page < 1)
        {
            return BadRequest(new { error = "Page must be greater than 0" });
        }

        if (pageSize < 1 || pageSize > 100)
        {
            return BadRequest(new { error = "PageSize must be between 1 and 100" });
        }

        try
        {
            var userId = GetUserId();
            var transactions = await _portfolioService.GetTransactionsAsync(userId, page, pageSize);
            return Ok(transactions);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when fetching transactions");
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching transactions");
            return StatusCode(500, new { error = "Failed to fetch transactions" });
        }
    }

    [HttpGet("performance")]
    [ProducesResponseType(typeof(PortfolioPerformanceDto), 200)]
    public async Task<ActionResult<PortfolioPerformanceDto>> GetPerformance()
    {
        try
        {
            var userId = GetUserId();
            var performance = await _portfolioService.GetPerformanceAsync(userId);
            return Ok(performance);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when fetching performance");
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching performance");
            return StatusCode(500, new { error = "Failed to fetch portfolio performance" });
        }
    }

    [HttpGet("holdings/{cryptoId}")]
    [ProducesResponseType(typeof(CryptoHoldingDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<CryptoHoldingDto>> GetHolding(string cryptoId)
    {
        if (string.IsNullOrWhiteSpace(cryptoId))
        {
            return BadRequest(new { error = "CryptoId is required" });
        }

        try
        {
            var userId = GetUserId();
            var holding = await _portfolioService.GetHoldingAsync(userId, cryptoId);

            if (holding == null)
            {
                return NotFound(new { error = $"Holding for '{cryptoId}' not found in portfolio" });
            }

            return Ok(holding);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation when fetching holding");
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching holding for {CryptoId}", cryptoId);
            return StatusCode(500, new { error = "Failed to fetch holding" });
        }
    }
}
