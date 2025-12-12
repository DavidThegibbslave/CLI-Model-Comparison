using CryptoMarket.Application.DTOs.Alerts;

namespace CryptoMarket.Application.Interfaces.Services;

public interface IPriceAlertService
{
    Task<List<PriceAlertDto>> GetUserAlertsAsync(Guid userId);
    Task<PriceAlertDto> CreateAlertAsync(Guid userId, CreatePriceAlertDto dto);
    Task<bool> DeleteAlertAsync(Guid userId, Guid alertId);
    Task<bool> ToggleAlertAsync(Guid userId, Guid alertId);
    Task CheckAndTriggerAlertsAsync(); // Called by background service
}
