import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Toast } from '../components/ui/Toast';
import { fetchCryptoList, fetchHistory } from '../services/cryptoService';
import { sampleAssets } from '../services/sampleData';
import type { CryptoAsset } from '../types/crypto';
import { classNames } from '../utils/classNames';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useContainerSize } from '../hooks/useContainerSize';

const COLORS = ['#1f64e0', '#ff7c1f', '#16a34a', '#e11d48', '#8b5cf6'];

export default function ComparePage() {
  const [available, setAvailable] = useState<CryptoAsset[]>([]);
  const [selected, setSelected] = useState<string[]>(['bitcoin', 'ethereum', 'solana']);
  const [search, setSearch] = useState('');
  const [histories, setHistories] = useState<Record<string, Array<{ timestamp: number; price: number }>>>({});
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { ref: chartRef, size: chartSize } = useContainerSize<HTMLDivElement>();

  useEffect(() => {
    setLoading(true);
    fetchCryptoList()
      .then((list) => setAvailable(list.length ? list : sampleAssets))
      .catch(() => setAvailable(sampleAssets))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoadingHistory(true);
    Promise.all(
      selected.map(async (id) => {
        const data = await fetchHistory(id, 7);
        return { id, data };
      }),
    )
      .then((entries) => {
        const map: Record<string, Array<{ timestamp: number; price: number }>> = {};
        entries.forEach((entry) => {
          map[entry.id] = entry.data;
        });
        setHistories(map);
      })
      .finally(() => setLoadingHistory(false));
  }, [selected]);

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return available.filter((asset) => asset.name.toLowerCase().includes(term) || asset.symbol.toLowerCase().includes(term)).slice(0, 10);
  }, [available, search]);

  const selectedAssets = selected
    .map((id) => available.find((a) => a.id === id) || sampleAssets.find((a) => a.id === id))
    .filter(Boolean) as CryptoAsset[];

  const chartData = useMemo(() => {
    const points: Record<number, any> = {};
    selectedAssets.forEach((asset) => {
      const symbol = asset.symbol;
      (histories[asset.id] || []).forEach((pt) => {
        const bucket = Math.floor(pt.timestamp / 3600000) * 3600000;
        if (!points[bucket]) points[bucket] = { timestamp: bucket };
        points[bucket][symbol] = pt.price;
      });
    });
    return Object.values(points).sort((a: any, b: any) => a.timestamp - b.timestamp);
  }, [histories, selectedAssets]);
  const chartReady = chartSize.width > 12 && chartSize.height > 200 && chartData.length > 0;

  function addAsset(id: string) {
    if (selected.includes(id)) return;
    if (selected.length >= 4) {
      setToast('Limit 4 assets at once');
      return;
    }
    setSelected((prev) => [...prev, id]);
  }

  function removeAsset(id: string) {
    setSelected((prev) => prev.filter((item) => item !== id));
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Compare assets</h1>
          <p className="section-subtitle">Side-by-side metrics, powered by /api/crypto/compare and history overlays.</p>
        </div>
        <Button
          onClick={() => {
            setSelected(['bitcoin', 'ethereum', 'solana']);
            setToast('Reset to default selection');
          }}
        >
          Reset
        </Button>
      </div>

      <Card title="Pick up to 4 assets" subtitle="Search and add; click chips to remove.">
        <div className="inline-actions" style={{ flexWrap: 'wrap', gap: 8 }}>
          {selected.map((id, idx) => {
            const asset = available.find((a) => a.id === id) || sampleAssets.find((a) => a.id === id);
            return (
              <button
                key={id}
                className="user-chip"
                onClick={() => removeAsset(id)}
                style={{ borderColor: COLORS[idx % COLORS.length], background: 'transparent' }}
              >
                <div className="avatar-chip" style={{ background: COLORS[idx % COLORS.length] }}>
                  {asset?.symbol?.slice(0, 2) ?? id.slice(0, 2).toUpperCase()}
                </div>
                <div className="user-meta">
                  <span className="user-email">{asset?.symbol ?? id}</span>
                  <span className="user-role">{asset?.name ?? id}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="inline-actions" style={{ marginTop: 12, flexWrap: 'wrap', gap: 12 }}>
          <Input placeholder="Search assets" value={search} onChange={(e) => setSearch(e.target.value)} style={{ minWidth: 240 }} />
          <div className="inline-actions" style={{ flexWrap: 'wrap' }}>
            {loading
              ? Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} width={80} height={20} />)
              : filteredOptions.map((asset, idx) => (
                  <Button
                    key={asset.id}
                    variant="ghost"
                    onClick={() => addAsset(asset.id)}
                    style={{ borderColor: COLORS[idx % COLORS.length] }}
                  >
                    {asset.symbol}
                  </Button>
                ))}
          </div>
        </div>
      </Card>

      <Card title="Comparison" subtitle="Prices, change, market cap, volume">
        {loading ? (
          <Skeleton height={22} />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>24h %</th>
                  <th>7d %</th>
                  <th>Market Cap</th>
                  <th>Volume</th>
                </tr>
              </thead>
              <tbody>
                {selectedAssets.map((asset, idx) => (
                  <tr key={asset.id}>
                    <td style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="status-dot" style={{ background: COLORS[idx % COLORS.length] }} />
                      <div>
                        <strong>{asset.name}</strong>
                        <div className="section-subtitle">{asset.symbol}</div>
                      </div>
                    </td>
                    <td>${asset.price.toLocaleString()}</td>
                    <td>
                      <span className={classNames('pill', asset.change24hPct >= 0 ? 'pill-success' : 'pill-danger')}>
                        {asset.change24hPct.toFixed(2)}%
                      </span>
                    </td>
                    <td>
                      <span className={classNames('pill', asset.change7dPct >= 0 ? 'pill-success' : 'pill-danger')}>
                        {asset.change7dPct.toFixed(2)}%
                      </span>
                    </td>
                    <td>${(asset.marketCap / 1e9).toFixed(2)}B</td>
                    <td>${(asset.volume24h / 1e9).toFixed(2)}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Overlay chart" subtitle="7d history overlay; add/remove assets to see lines update.">
        {loadingHistory ? (
          <Skeleton height={280} />
        ) : (
          <div ref={chartRef} style={{ width: '100%', height: 320, minHeight: 280 }}>
            {chartReady ? (
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <XAxis
                    type="number"
                    dataKey="timestamp"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    stroke="var(--color-muted)"
                  />
                  <YAxis stroke="var(--color-muted)" tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Tooltip
                    labelFormatter={(value) => new Date(Number(value)).toLocaleString()}
                    formatter={(value: number, name: string) => [`$${Number(value).toLocaleString()}`, name]}
                    contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
                  />
                  {selectedAssets.map((asset, idx) => (
                    <Line
                      key={asset.id}
                      dataKey={asset.symbol}
                      name={asset.symbol}
                      stroke={COLORS[idx % COLORS.length]}
                      dot={false}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--color-muted)' }}>
                {chartData.length ? 'Preparing chart...' : 'No data to chart'}
              </div>
            )}
          </div>
        )}
      </Card>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
