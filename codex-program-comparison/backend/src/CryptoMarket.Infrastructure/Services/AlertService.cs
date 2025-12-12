using System.Collections.Concurrent;
using CryptoMarket.Application.DTOs.Alerts;
using CryptoMarket.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace CryptoMarket.Infrastructure.Services;

public class AlertService : IAlertService
{
    private readonly ILogger<AlertService> _logger;
    private static readonly ConcurrentDictionary<Guid, List<AlertState>> _alerts = new();

    public AlertService(ILogger<AlertService> logger)
    {
        _logger = logger;
    }

    public Task<IReadOnlyList<AlertDto>> GetAlertsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var list = _alerts.GetOrAdd(userId, _ => new List<AlertState>());
        return Task.FromResult<IReadOnlyList<AlertDto>>(list.Select(Map).ToList());
    }

    public Task<AlertDto?> CreateAlertAsync(Guid userId, AlertRequest request, CancellationToken cancellationToken = default)
    {
        var list = _alerts.GetOrAdd(userId, _ => new List<AlertState>());
        var alert = new AlertState
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CryptoAssetId = request.CryptoAssetId.ToLowerInvariant(),
            ConditionType = request.ConditionType,
            Direction = request.Direction,
            ThresholdValue = request.ThresholdValue,
            Channel = request.Channel,
            IsActive = true
        };
        list.Add(alert);
        _logger.LogInformation("Alert created for user {UserId}: {AssetId} {ConditionType} {Direction} {Threshold}", userId, alert.CryptoAssetId, alert.ConditionType, alert.Direction, alert.ThresholdValue);
        return Task.FromResult<AlertDto?>(Map(alert));
    }

    public Task<AlertDto?> UpdateAlertAsync(Guid userId, Guid alertId, AlertRequest request, CancellationToken cancellationToken = default)
    {
        var list = _alerts.GetOrAdd(userId, _ => new List<AlertState>());
        var alert = list.FirstOrDefault(a => a.Id == alertId);
        if (alert == null) return Task.FromResult<AlertDto?>(null);

        alert.CryptoAssetId = request.CryptoAssetId.ToLowerInvariant();
        alert.ConditionType = request.ConditionType;
        alert.Direction = request.Direction;
        alert.ThresholdValue = request.ThresholdValue;
        alert.Channel = request.Channel;
        return Task.FromResult<AlertDto?>(Map(alert));
    }

    public Task<bool> DeleteAlertAsync(Guid userId, Guid alertId, CancellationToken cancellationToken = default)
    {
        var list = _alerts.GetOrAdd(userId, _ => new List<AlertState>());
        var removed = list.RemoveAll(a => a.Id == alertId) > 0;
        return Task.FromResult(removed);
    }

    private static AlertDto Map(AlertState state) => new()
    {
        Id = state.Id,
        CryptoAssetId = state.CryptoAssetId,
        ConditionType = state.ConditionType,
        Direction = state.Direction,
        ThresholdValue = state.ThresholdValue,
        Channel = state.Channel,
        IsActive = state.IsActive
    };

    private class AlertState
    {
        public Guid Id { get; init; }
        public Guid UserId { get; init; }
        public string CryptoAssetId { get; set; } = string.Empty;
        public string ConditionType { get; set; } = string.Empty;
        public string Direction { get; set; } = string.Empty;
        public decimal ThresholdValue { get; set; }
        public string Channel { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
