using CryptoMarket.Application.DTOs.Portfolio;
using CryptoMarket.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CryptoMarket.Web.Controllers;

[ApiController]
[Route("api/portfolios")]
public class PortfolioController : ControllerBase
{
    private static readonly Guid DemoUserId = Guid.Parse("00000000-0000-0000-0000-000000000042");
    private readonly IPortfolioService _portfolioService;

    public PortfolioController(IPortfolioService portfolioService)
    {
        _portfolioService = portfolioService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPortfolios()
    {
        var userId = GetUserId();
        var portfolios = await _portfolioService.GetUserPortfoliosAsync(userId);
        return Ok(portfolios);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePortfolio(CreatePortfolioRequest request)
    {
        var userId = GetUserId();
        var portfolio = await _portfolioService.CreatePortfolioAsync(userId, request);
        return CreatedAtAction(nameof(GetPortfolio), new { id = portfolio.Id }, portfolio);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPortfolio(Guid id)
    {
        var userId = GetUserId();
        var portfolio = await _portfolioService.GetPortfolioAsync(id, userId);
        if (portfolio == null) return NotFound();
        return Ok(portfolio);
    }

    [HttpPost("{id}/buy")]
    public async Task<IActionResult> BuyAsset(Guid id, OrderRequest request)
    {
        var userId = GetUserId();
        try
        {
            var result = await _portfolioService.ExecuteOrderAsync(userId, id, request, "Buy");
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = new { code = "ORDER_FAILED", message = ex.Message } });
        }
    }

    [HttpPost("{id}/sell")]
    public async Task<IActionResult> SellAsset(Guid id, OrderRequest request)
    {
        var userId = GetUserId();
        try
        {
            var result = await _portfolioService.ExecuteOrderAsync(userId, id, request, "Sell");
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = new { code = "ORDER_FAILED", message = ex.Message } });
        }
    }

    [HttpGet("{id}/transactions")]
    public async Task<IActionResult> GetTransactions(Guid id)
    {
        var userId = GetUserId();
        try
        {
            var transactions = await _portfolioService.GetTransactionsAsync(userId, id);
            return Ok(transactions);
        }
        catch
        {
            return NotFound();
        }
    }

    private Guid GetUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (idClaim == null) return DemoUserId;
        return Guid.Parse(idClaim.Value);
    }
}
