using System.Security.Claims;
using CryptoMarket.Application.DTOs.Alerts;
using CryptoMarket.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CryptoMarket.Web.Controllers;

[ApiController]
[Authorize]
[Route("api/alerts")]
public class AlertsController : ControllerBase
{
    private readonly IAlertService _alertService;

    public AlertsController(IAlertService alertService)
    {
        _alertService = alertService;
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        var alerts = await _alertService.GetAlertsAsync(userId, cancellationToken);
        return Ok(alerts);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AlertRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        var alert = await _alertService.CreateAlertAsync(userId, request, cancellationToken);
        return Created($"/api/alerts/{alert?.Id}", alert);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AlertRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        var alert = await _alertService.UpdateAlertAsync(userId, id, request, cancellationToken);
        if (alert == null) return NotFound();
        return Ok(alert);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();
        var removed = await _alertService.DeleteAlertAsync(userId, id, cancellationToken);
        if (!removed) return NotFound();
        return NoContent();
    }

    private Guid GetUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(idClaim, out var id) ? id : Guid.Empty;
    }
}
