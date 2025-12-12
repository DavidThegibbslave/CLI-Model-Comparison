using CryptoMarket.Application.DTOs.Alerts;

namespace CryptoMarket.Application.Interfaces;

public interface IAlertService
{
    Task<IReadOnlyList<AlertDto>> GetAlertsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<AlertDto?> CreateAlertAsync(Guid userId, AlertRequest request, CancellationToken cancellationToken = default);
    Task<AlertDto?> UpdateAlertAsync(Guid userId, Guid alertId, AlertRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAlertAsync(Guid userId, Guid alertId, CancellationToken cancellationToken = default);
}
