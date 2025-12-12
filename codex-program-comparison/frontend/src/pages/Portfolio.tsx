import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { Toast } from '../components/ui/Toast';
import { createAlert, deleteAlert, fetchAlerts, fetchPortfolios, removePosition, savePortfolio, upsertPosition } from '../services/portfolioService';
import type { AlertRule, Portfolio } from '../types/portfolio';
import { sampleAssets } from '../services/sampleData';
import { classNames } from '../utils/classNames';

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertLoading, setAlertLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewPortfolio, setShowNewPortfolio] = useState(false);
  const [portfolioName, setPortfolioName] = useState('');
  const [riskTolerance, setRiskTolerance] = useState('medium');
  const [positionForm, setPositionForm] = useState({ assetId: 'bitcoin', quantity: 1, avgPrice: 1000 });
  const [alertForm, setAlertForm] = useState({ assetId: 'bitcoin', threshold: 65000, direction: 'above', channel: 'email' });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPortfolios()
      .then((data) => {
        setPortfolios(data);
        if (!selectedId && data.length) setSelectedId(data[0].id);
      })
      .catch((err: any) => setError(err?.message || 'Unable to load portfolios'))
      .finally(() => setLoading(false));
  }, [selectedId]);

  useEffect(() => {
    setAlertLoading(true);
    setAlertError(null);
    fetchAlerts()
      .then((data) => setAlerts(data))
      .catch((err: any) => setAlertError(err?.message || 'Unable to load alerts'))
      .finally(() => setAlertLoading(false));
  }, []);

  const selected = useMemo(() => portfolios.find((p) => p.id === selectedId) ?? portfolios[0], [portfolios, selectedId]);
  const totalValue = selected?.totalValue ?? 0;
  const pnl = selected?.pnl ?? 0;

  async function handleAddPortfolio() {
    if (!portfolioName.trim()) return;
    const next: Portfolio = { id: '', name: portfolioName.trim(), riskTolerance, positions: [], totalValue: 0, pnl: 0 };
    const updated = await savePortfolio(next);
    setPortfolios(updated);
    setSelectedId(updated[updated.length - 1].id);
    setPortfolioName('');
    setShowNewPortfolio(false);
  }

  async function handleAddPosition() {
    if (!selected) return;
    const updated = await upsertPosition(selected.id, {
      cryptoAssetId: positionForm.assetId,
      symbol: positionForm.assetId.toUpperCase(),
      quantity: positionForm.quantity,
      avgPrice: positionForm.avgPrice,
    } as any);
    setPortfolios(updated);
    setToast('Position saved');
  }

  async function handleRemovePosition(positionId: string) {
    if (!selected) return;
    const updated = await removePosition(selected.id, positionId);
    setPortfolios(updated);
  }

  async function handleCreateAlert() {
    const updated = await createAlert({
      cryptoAssetId: alertForm.assetId,
      conditionType: 'price_up',
      direction: alertForm.direction,
      thresholdValue: alertForm.threshold,
      channel: alertForm.channel,
    });
    setAlerts(updated);
    setToast('Alert created');
  }

  async function handleDeleteAlert(id: string) {
    const updated = await deleteAlert(id);
    setAlerts(updated);
  }

  return (
    <div className="page-container page-fade">
      <div className="page-header">
        <div>
          <h1>Portfolio & Alerts</h1>
          <p className="section-subtitle">Track holdings, compute value, and surface rule-based alerts. Connected to /api/portfolio and /api/alerts with fallback data.</p>
        </div>
        <Button variant="secondary" onClick={() => setShowNewPortfolio(true)}>
          New portfolio
        </Button>
      </div>

      <div className="metric-grid">
        <Card title="Portfolio value" subtitle="Calculated from latest prices">
          {loading ? <Skeleton height={24} width="60%" /> : <strong style={{ fontSize: 28 }}>${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>}
          <span className={classNames('pill', pnl >= 0 ? 'pill-success' : 'pill-danger')}>{pnl >= 0 ? `+${pnl.toFixed(0)}` : pnl.toFixed(0)}</span>
        </Card>
        <Card title="Positions" subtitle="Per selected portfolio">
          {loading ? <Skeleton height={24} width="40%" /> : <strong style={{ fontSize: 28 }}>{selected?.positions.length ?? 0}</strong>}
          <span className="pill">Tracked</span>
        </Card>
        <Card title="Alerts" subtitle="Price/volume triggers">
          {alertLoading ? <Skeleton height={24} width="30%" /> : <strong style={{ fontSize: 28 }}>{alerts.length}</strong>}
          <span className="pill pill-neutral">Active</span>
        </Card>
      </div>

      <div className="dashboard-grid">
        <div>
          <Card
            title="Portfolios"
            subtitle="Switch between saved sets"
            actions={
              <div className="inline-actions">
                <select className="input-field input-compact" value={selected?.id ?? ''} onChange={(e) => setSelectedId(e.target.value)}>
                  {portfolios.map((pf) => (
                    <option key={pf.id} value={pf.id}>
                      {pf.name}
                    </option>
                  ))}
                </select>
              </div>
            }
          >
            {error && <div className="section-subtitle error">{error}</div>}
            {loading ? (
              <Skeleton height={18} />
            ) : selected ? (
              <ul className="list">
                {selected.positions.map((position) => (
                  <li key={position.id} className="list-item">
                    <div>
                      <strong>
                        {position.name} ({position.symbol})
                      </strong>
                      <div className="section-subtitle">
                        {position.quantity} @ ${position.avgPrice.toLocaleString()}
                      </div>
                    </div>
                    <div className="inline-actions">
                      <div>
                        <div>${(position.quantity * position.currentPrice).toLocaleString()}</div>
                        <div className={classNames('pill', position.currentPrice >= position.avgPrice ? 'pill-success' : 'pill-danger')}>
                          {((position.currentPrice - position.avgPrice) / position.avgPrice * 100).toFixed(2)}%
                        </div>
                      </div>
                      <Button variant="ghost" onClick={() => handleRemovePosition(position.id)}>
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="section-subtitle">No portfolios yet.</div>
            )}
          </Card>

          <Card title="Add / update position" subtitle="Persisted via API when available; cached locally otherwise.">
            <div className="inline-actions" style={{ flexWrap: 'wrap', gap: 12 }}>
              <label className="input-wrapper" style={{ minWidth: 180 }}>
                <span className="input-label">Asset</span>
                <select
                  className="input-field"
                  value={positionForm.assetId}
                  onChange={(e) => setPositionForm((prev) => ({ ...prev, assetId: e.target.value }))}
                >
                  {sampleAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.symbol})
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label="Quantity"
                type="number"
                value={positionForm.quantity}
                onChange={(e) => setPositionForm((prev) => ({ ...prev, quantity: Number(e.target.value) || 0 }))}
                style={{ minWidth: 140 }}
              />
              <Input
                label="Avg price"
                type="number"
                value={positionForm.avgPrice}
                onChange={(e) => setPositionForm((prev) => ({ ...prev, avgPrice: Number(e.target.value) || 0 }))}
                style={{ minWidth: 160 }}
              />
              <Button variant="primary" onClick={handleAddPosition}>
                Save position
              </Button>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Alerts" subtitle="Create thresholds for watch assets">
            {alertError && <div className="section-subtitle error">{alertError}</div>}
            {alertLoading ? (
              <Skeleton height={18} />
            ) : (
              <ul className="list">
                {alerts.map((alert) => (
                  <li key={alert.id} className="list-item">
                    <div>
                      <strong>
                        {alert.symbol} {alert.direction === 'above' ? '≥' : '≤'} ${alert.thresholdValue.toLocaleString()}
                      </strong>
                      <div className="section-subtitle">{alert.channel}</div>
                    </div>
                    <Button variant="ghost" onClick={() => handleDeleteAlert(alert.id)}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="New alert" subtitle="Stored via /api/alerts with fallback">
            <div className="inline-actions" style={{ flexWrap: 'wrap', gap: 12 }}>
              <label className="input-wrapper" style={{ minWidth: 180 }}>
                <span className="input-label">Asset</span>
                <select
                  className="input-field"
                  value={alertForm.assetId}
                  onChange={(e) => setAlertForm((prev) => ({ ...prev, assetId: e.target.value }))}
                >
                  {sampleAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.symbol})
                    </option>
                  ))}
                </select>
              </label>
              <label className="input-wrapper" style={{ minWidth: 140 }}>
                <span className="input-label">Direction</span>
                <select
                  className="input-field"
                  value={alertForm.direction}
                  onChange={(e) => setAlertForm((prev) => ({ ...prev, direction: e.target.value }))}
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
              </label>
              <Input
                label="Threshold"
                type="number"
                value={alertForm.threshold}
                onChange={(e) => setAlertForm((prev) => ({ ...prev, threshold: Number(e.target.value) || 0 }))}
                style={{ minWidth: 160 }}
              />
              <label className="input-wrapper" style={{ minWidth: 140 }}>
                <span className="input-label">Channel</span>
                <select
                  className="input-field"
                  value={alertForm.channel}
                  onChange={(e) => setAlertForm((prev) => ({ ...prev, channel: e.target.value }))}
                >
                  <option value="email">Email</option>
                  <option value="push">Push</option>
                </select>
              </label>
              <Button variant="secondary" onClick={handleCreateAlert}>
                Create alert
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Modal open={showNewPortfolio} onClose={() => setShowNewPortfolio(false)} title="New portfolio">
        <div className="inline-actions" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
          <Input label="Name" value={portfolioName} onChange={(e) => setPortfolioName(e.target.value)} />
          <label className="input-wrapper">
            <span className="input-label">Risk tolerance</span>
            <select className="input-field" value={riskTolerance} onChange={(e) => setRiskTolerance(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <div className="inline-actions" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowNewPortfolio(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddPortfolio}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
    </div>
  );
}
