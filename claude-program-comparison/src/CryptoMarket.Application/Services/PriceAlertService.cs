using CryptoMarket.Application.DTOs.Alerts;
using CryptoMarket.Application.Interfaces.Repositories;
using CryptoMarket.Application.Interfaces.Services;
using CryptoMarket.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace CryptoMarket.Application.Services;

public class PriceAlertService : IPriceAlertService
{
    private readonly IPriceAlertRepository _alertRepository;
    private readonly ICryptoService _cryptoService;
    private readonly ILogger<PriceAlertService> _logger;

    public PriceAlertService(
        IPriceAlertRepository alertRepository,
        ICryptoService cryptoService,
        ILogger<PriceAlertService> logger)
    {
        _alertRepository = alertRepository;
        _cryptoService = cryptoService;
        _logger = logger;
    }

    public async Task<List<PriceAlertDto>> GetUserAlertsAsync(Guid userId)
    {
        var alerts = await _alertRepository.GetByUserIdAsync(userId);
        var alertDtos = new List<PriceAlertDto>();

        foreach (var alert in alerts)
        {
            var dto = MapToDto(alert);

            // Enrich with current price if active
            if (alert.IsActive && !alert.IsTriggered)
            {
                try
                {
                    var cryptoDetail = await _cryptoService.GetCryptoDetailAsync(alert.CryptoId);
                    if (cryptoDetail != null)
                    {
                        dto.CurrentPrice = cryptoDetail.CurrentPrice;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to fetch current price for {CryptoId}", alert.CryptoId);
                }
            }

            alertDtos.Add(dto);
        }

        return alertDtos;
    }

    public async Task<PriceAlertDto> CreateAlertAsync(Guid userId, CreatePriceAlertDto dto)
    {
        // Fetch crypto details to validate and get name/symbol
        var cryptoDetail = await _cryptoService.GetCryptoDetailAsync(dto.CryptoId);
        if (cryptoDetail == null)
        {
            throw new KeyNotFoundException($"Cryptocurrency '{dto.CryptoId}' not found");
        }

        var alert = new PriceAlert
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CryptoId = dto.CryptoId,
            Symbol = cryptoDetail.Symbol,
            Name = cryptoDetail.Name,
            TargetPrice = dto.TargetPrice,
            IsAbove = dto.IsAbove,
            IsActive = true,
            IsTriggered = false,
            CreatedAt = DateTime.UtcNow
        };

        var createdAlert = await _alertRepository.CreateAsync(alert);
        _logger.LogInformation("Price alert created for user {UserId}: {CryptoId} {Direction} {TargetPrice}",
            userId, dto.CryptoId, dto.IsAbove ? "above" : "below", dto.TargetPrice);

        var result = MapToDto(createdAlert);
        result.CurrentPrice = cryptoDetail.CurrentPrice;
        return result;
    }

    public async Task<bool> DeleteAlertAsync(Guid userId, Guid alertId)
    {
        var alert = await _alertRepository.GetByIdAsync(alertId);
        if (alert == null || alert.UserId != userId)
        {
            return false;
        }

        await _alertRepository.DeleteAsync(alertId);
        _logger.LogInformation("Price alert {AlertId} deleted by user {UserId}", alertId, userId);
        return true;
    }

    public async Task<bool> ToggleAlertAsync(Guid userId, Guid alertId)
    {
        var alert = await _alertRepository.GetByIdAsync(alertId);
        if (alert == null || alert.UserId != userId)
        {
            return false;
        }

        alert.IsActive = !alert.IsActive;
        await _alertRepository.UpdateAsync(alert);
        _logger.LogInformation("Price alert {AlertId} toggled to {IsActive} by user {UserId}",
            alertId, alert.IsActive, userId);
        return true;
    }

    public async Task CheckAndTriggerAlertsAsync()
    {
        var activeAlerts = await _alertRepository.GetActiveAlertsAsync();
        if (!activeAlerts.Any())
        {
            return;
        }

        _logger.LogInformation("Checking {Count} active price alerts", activeAlerts.Count);

        // Group alerts by crypto to minimize API calls
        var alertsByCrypto = activeAlerts.GroupBy(a => a.CryptoId);

        foreach (var group in alertsByCrypto)
        {
            try
            {
                var cryptoDetail = await _cryptoService.GetCryptoDetailAsync(group.Key);
                if (cryptoDetail == null)
                {
                    _logger.LogWarning("Skipping alerts for {CryptoId} because no market data was returned", group.Key);
                    continue;
                }
                var currentPrice = cryptoDetail.CurrentPrice;

                foreach (var alert in group)
                {
                    bool shouldTrigger = alert.IsAbove
                        ? currentPrice >= alert.TargetPrice
                        : currentPrice <= alert.TargetPrice;

                    if (shouldTrigger)
                    {
                        alert.IsTriggered = true;
                        alert.IsActive = false;
                        alert.TriggeredAt = DateTime.UtcNow;
                        await _alertRepository.UpdateAsync(alert);

                        _logger.LogInformation(
                            "Price alert triggered for user {UserId}: {CryptoId} is {CurrentPrice} ({Direction} {TargetPrice})",
                            alert.UserId, alert.CryptoId, currentPrice,
                            alert.IsAbove ? "above" : "below", alert.TargetPrice);

                        // In a real application, send notification here (email, push notification, etc.)
                        // For now, just log it
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking alerts for {CryptoId}", group.Key);
            }
        }
    }

    private PriceAlertDto MapToDto(PriceAlert alert)
    {
        return new PriceAlertDto
        {
            Id = alert.Id,
            CryptoId = alert.CryptoId,
            Symbol = alert.Symbol,
            Name = alert.Name,
            TargetPrice = alert.TargetPrice,
            IsAbove = alert.IsAbove,
            IsActive = alert.IsActive,
            IsTriggered = alert.IsTriggered,
            CreatedAt = alert.CreatedAt,
            TriggeredAt = alert.TriggeredAt
        };
    }
}
