using System.Security.Claims;
using CryptoMarket.Application.DTOs.Portfolio;
using CryptoMarket.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CryptoMarket.Web.Controllers;

[ApiController]
[Authorize]
[Route("api/portfolio")]
public class PortfolioController : ControllerBase
{
    private readonly IPortfolioService _portfolioService;

    public PortfolioController(IPortfolioService portfolioService)
    {
        _portfolioService = portfolioService;
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        var portfolios = await _portfolioService.GetPortfoliosAsync(userId, cancellationToken);
        return Ok(portfolios);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        var portfolio = await _portfolioService.GetPortfolioAsync(userId, id, cancellationToken);
        if (portfolio == null) return NotFound();
        return Ok(portfolio);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PortfolioRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        var portfolio = await _portfolioService.CreatePortfolioAsync(userId, request, cancellationToken);
        return Created($"/api/portfolio/{portfolio.Id}", portfolio);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] PortfolioRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        var portfolio = await _portfolioService.UpdatePortfolioAsync(userId, id, request, cancellationToken);
        if (portfolio == null) return NotFound();
        return Ok(portfolio);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        var removed = await _portfolioService.DeletePortfolioAsync(userId, id, cancellationToken);
        if (!removed) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/positions")]
    public async Task<IActionResult> AddPosition(Guid id, [FromBody] PortfolioPositionRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        var portfolio = await _portfolioService.AddPositionAsync(userId, id, request, cancellationToken);
        if (portfolio == null) return NotFound();
        return Ok(portfolio);
    }

    [HttpDelete("{id}/positions/{positionId}")]
    public async Task<IActionResult> RemovePosition(Guid id, Guid positionId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        var portfolio = await _portfolioService.RemovePositionAsync(userId, id, positionId, cancellationToken);
        if (portfolio == null) return NotFound();
        return Ok(portfolio);
    }

    private Guid GetUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(idClaim, out var id) ? id : Guid.Empty;
    }
}
