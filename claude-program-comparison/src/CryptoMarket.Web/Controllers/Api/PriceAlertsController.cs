using System.Security.Claims;
using CryptoMarket.Application.DTOs.Alerts;
using CryptoMarket.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CryptoMarket.Web.Controllers.Api;

[ApiController]
[Route("api/alerts")]
[Authorize]
public class PriceAlertsController : ControllerBase
{
    private readonly IPriceAlertService _alertService;
    private readonly ILogger<PriceAlertsController> _logger;

    public PriceAlertsController(IPriceAlertService alertService, ILogger<PriceAlertsController> logger)
    {
        _alertService = alertService;
        _logger = logger;
    }

    /// <summary>
    /// Get all price alerts for the current user
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<PriceAlertDto>>> GetUserAlerts()
    {
        try
        {
            var userId = GetUserId();
            var alerts = await _alertService.GetUserAlertsAsync(userId);
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user alerts");
            return StatusCode(500, "An error occurred while fetching alerts");
        }
    }

    /// <summary>
    /// Create a new price alert
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PriceAlertDto>> CreateAlert([FromBody] CreatePriceAlertDto dto)
    {
        try
        {
            var userId = GetUserId();
            var alert = await _alertService.CreateAlertAsync(userId, dto);
            return CreatedAtAction(nameof(GetUserAlerts), new { id = alert.Id }, alert);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Cryptocurrency not found: {CryptoId}", dto.CryptoId);
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating price alert");
            return StatusCode(500, "An error occurred while creating the alert");
        }
    }

    /// <summary>
    /// Delete a price alert
    /// </summary>
    [HttpDelete("{alertId}")]
    public async Task<ActionResult> DeleteAlert(Guid alertId)
    {
        try
        {
            var userId = GetUserId();
            var success = await _alertService.DeleteAlertAsync(userId, alertId);

            if (!success)
            {
                return NotFound(new { error = "Alert not found or unauthorized" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting price alert {AlertId}", alertId);
            return StatusCode(500, "An error occurred while deleting the alert");
        }
    }

    /// <summary>
    /// Toggle alert active status
    /// </summary>
    [HttpPatch("{alertId}/toggle")]
    public async Task<ActionResult> ToggleAlert(Guid alertId)
    {
        try
        {
            var userId = GetUserId();
            var success = await _alertService.ToggleAlertAsync(userId, alertId);

            if (!success)
            {
                return NotFound(new { error = "Alert not found or unauthorized" });
            }

            return Ok(new { message = "Alert status toggled successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling price alert {AlertId}", alertId);
            return StatusCode(500, "An error occurred while toggling the alert");
        }
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
}
