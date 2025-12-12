import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { Sparkline } from '../components/charts/Sparkline';
import { HistoryChart } from '../components/charts/HistoryChart';
import { fetchCryptoList, fetchHistory, fetchMarketStats, fetchTopMovers } from '../services/cryptoService';
import { createMarketFeed } from '../services/marketFeed';
import type { CryptoAsset } from '../types/crypto';
import { classNames } from '../utils/classNames';

type SortKey = 'rank' | 'name' | 'price' | 'change24hPct' | 'change7dPct' | 'marketCap' | 'volume24h';
type SortDir = 'asc' | 'desc';

function formatCurrency(value: number) {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number) {
  const fixed = Math.abs(value) >= 10 ? value.toFixed(1) : value.toFixed(2);
  return `${value >= 0 ? '+' : ''}${fixed}%`;
}

export default function DashboardPage() {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [topMovers, setTopMovers] = useState<CryptoAsset[]>([]);
  const [marketStats, setMarketStats] = useState<{ totalMarketCap: number; volume24h: number; btcDominance: number; fearGreedIndex?: number } | null>(null);
  const [historyData, setHistoryData] = useState<Array<{ timestamp: number; price: number }>>([]);
  const [historyRange, setHistoryRange] = useState(7);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'live' | 'fallback' | 'error' | 'stopped'>('idle');
  const [flashMap, setFlashMap] = useState<Record<string, 'up' | 'down'>>({});
  const [showToast, setShowToast] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pageSize = isMobile ? 6 : 10;

  async function loadAssets() {
    setLoadingAssets(true);
    setError(null);
    try {
      const [list, movers] = await Promise.all([fetchCryptoList(), fetchTopMovers()]);
      setAssets(list);
      setTopMovers(movers);
    } catch (err: any) {
      setError(err?.message || 'Unable to load market data');
    } finally {
      setLoadingAssets(false);
    }
  }

  async function loadStats() {
    setLoadingStats(true);
    const stats = await fetchMarketStats();
    setMarketStats(stats);
    setLoadingStats(false);
  }

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    void loadAssets();
    void loadStats();
  }, []);

  useEffect(() => {
    const handle = createMarketFeed(
      (update) => {
        setAssets((prev) =>
          prev.map((asset) => {
            if (asset.id !== update.id) return asset;
            const direction = update.price >= asset.price ? 'up' : 'down';
            setFlashMap((prevMap) => ({ ...prevMap, [asset.id]: direction }));
            window.setTimeout(() => {
              setFlashMap((prevMap) => {
                const next = { ...prevMap };
                delete next[asset.id];
                return next;
              });
            }, 600);

            const sparkline = [...asset.sparkline, { t: Date.now(), v: update.price }].slice(-30);
            return {
              ...asset,
              price: update.price,
              change24hPct: update.change24hPct ?? asset.change24hPct,
              change7dPct: update.change7dPct ?? asset.change7dPct,
              volume24h: update.volume24h ?? asset.volume24h,
              sparkline,
            };
          }),
        );
      },
      setConnectionStatus,
    );
    return () => handle.close();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sortKey, sortDir, pageSize]);

  useEffect(() => {
    if (!selectedAsset) return;
    setLoadingHistory(true);
    setHistoryError(null);
    fetchHistory(selectedAsset.id, historyRange)
      .then((data) => setHistoryData(data))
      .catch((err: any) => setHistoryError(err?.message || 'Unable to load history'))
      .finally(() => setLoadingHistory(false));
  }, [selectedAsset, historyRange]);

  const filteredAssets = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = [...assets];
    if (term) {
      list = list.filter((asset) => asset.name.toLowerCase().includes(term) || asset.symbol.toLowerCase().includes(term));
    }
    list.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (typeof aValue === 'string') {
        return sortDir === 'asc' ? aValue.localeCompare(bValue as string) : (bValue as string).localeCompare(aValue);
      }
      return sortDir === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });
    return list;
  }, [assets, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / pageSize));
  const pageAssets = filteredAssets.slice((page - 1) * pageSize, page * pageSize);

  const topGainers = useMemo(() => [...assets].sort((a, b) => b.change24hPct - a.change24hPct).slice(0, 3), [assets]);
  const topLosers = useMemo(() => [...assets].sort((a, b) => a.change24hPct - b.change24hPct).slice(0, 3), [assets]);

  const connectionLabel =
    connectionStatus === 'live'
      ? 'Live'
      : connectionStatus === 'fallback'
        ? 'Simulated updates'
        : connectionStatus === 'connecting'
          ? 'Connecting'
          : 'Idle';

  function toggleSort(next: SortKey) {
    if (next === sortKey) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(next);
      setSortDir(next === 'rank' ? 'asc' : 'desc');
    }
  }

  function openAsset(asset: CryptoAsset) {
    setSelectedAsset(asset);
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Market Pulse</h1>
          <p className="section-subtitle">Live snapshots, movers, and sparkline trends with SignalR fallback polling.</p>
        </div>
        <div className="inline-actions">
          <span className="pill pill-neutral">
            <span className={classNames('status-dot', connectionStatus === 'live' && 'status-live', connectionStatus === 'fallback' && 'status-fallback')} />
            {connectionLabel}
          </span>
          <Button
            onClick={() => {
              void loadAssets();
              void loadStats();
              setShowToast(true);
            }}
            isLoading={loadingAssets || loadingStats}
          >
            Refresh data
          </Button>
        </div>
      </div>

      <div className="hero">
        <div>
          <h2 className="section-title">Stay ahead of the next move</h2>
          <p className="section-subtitle">
            Real-time prices from CoinGecko + SignalR broadcasts. Compare assets, track your demo portfolio, and surface alerts without leaving this tab.
          </p>
        </div>
        <div className="hero-actions">
          <Button variant="secondary">Open compare</Button>
          <Button variant="ghost">View alerts</Button>
        </div>
      </div>

      <div className="metric-grid" style={{ marginTop: 'var(--space-5)' }}>
        <Card title="Total Market Cap" subtitle="Live aggregate">
          {loadingStats ? <Skeleton width="60%" height={28} /> : <strong style={{ fontSize: 28 }}>{formatCurrency(marketStats?.totalMarketCap ?? 0)}</strong>}
          <span className="pill pill-success">Updated</span>
        </Card>
        <Card title="24h Volume" subtitle="Across tracked pairs">
          {loadingStats ? <Skeleton width="50%" height={28} /> : <strong style={{ fontSize: 28 }}>{formatCurrency(marketStats?.volume24h ?? 0)}</strong>}
          <span className="pill pill-success">Streaming</span>
        </Card>
        <Card title="BTC Dominance" subtitle="Share of market cap">
          {loadingStats ? <Skeleton width="40%" height={28} /> : <strong style={{ fontSize: 28 }}>{(marketStats?.btcDominance ?? 0).toFixed(1)}%</strong>}
          <span className="pill pill-neutral">Index</span>
        </Card>
        <Card title="Fear & Greed" subtitle="Sentiment index">
          {loadingStats ? <Skeleton width="30%" height={28} /> : <strong style={{ fontSize: 28 }}>{marketStats?.fearGreedIndex ?? 62}</strong>}
          <span className="pill pill-neutral">Daily</span>
        </Card>
      </div>

      <div className="dashboard-grid">
        <div>
          <Card
            title="Market overview"
            subtitle="Search, sort, and tap rows for details. Live updates will flash green/red."
            actions={
              <div className="inline-actions">
                <Input
                  placeholder="Search name or symbol"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-compact"
                  style={{ minWidth: 200 }}
                />
              </div>
            }
          >
            {error && (
              <div className="section-subtitle error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{error}</span>
                <Button variant="ghost" onClick={() => void loadAssets()}>
                  Retry
                </Button>
              </div>
            )}

            <div className="desktop-table">
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th onClick={() => toggleSort('rank')}>#</th>
                      <th onClick={() => toggleSort('name')}>Name</th>
                      <th onClick={() => toggleSort('price')}>Price</th>
                      <th onClick={() => toggleSort('change24hPct')}>24h %</th>
                      <th onClick={() => toggleSort('change7dPct')}>7d %</th>
                      <th onClick={() => toggleSort('marketCap')}>Market Cap</th>
                      <th onClick={() => toggleSort('volume24h')}>Volume</th>
                      <th>Sparkline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAssets
                      ? Array.from({ length: 6 }).map((_, idx) => (
                          <tr key={idx}>
                            <td colSpan={8}>
                              <Skeleton height={16} />
                            </td>
                          </tr>
                        ))
                      : pageAssets.map((asset) => (
                          <tr
                            key={asset.id}
                            className={classNames('table-row', flashMap[asset.id] === 'up' && 'flash-up', flashMap[asset.id] === 'down' && 'flash-down')}
                            onClick={() => openAsset(asset)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>{asset.rank}</td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong>{asset.name}</strong>
                                <span className="section-subtitle">{asset.symbol}</span>
                              </div>
                            </td>
                            <td>{formatCurrency(asset.price)}</td>
                            <td>
                              <span className={classNames('pill', asset.change24hPct >= 0 ? 'pill-success' : 'pill-danger')}>
                                {formatPercent(asset.change24hPct)}
                              </span>
                            </td>
                            <td>
                              <span className={classNames('pill', asset.change7dPct >= 0 ? 'pill-success' : 'pill-danger')}>
                                {formatPercent(asset.change7dPct)}
                              </span>
                            </td>
                            <td>{formatCurrency(asset.marketCap)}</td>
                            <td>{formatCurrency(asset.volume24h)}</td>
                            <td>
                              <Sparkline data={asset.sparkline} color={asset.change7dPct >= 0 ? 'var(--color-success-500)' : 'var(--color-danger-500)'} />
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
              {!loadingAssets && (
                <div className="inline-actions" style={{ justifyContent: 'space-between', marginTop: 12 }}>
                  <span className="section-subtitle">
                    Page {page} of {totalPages}
                  </span>
                  <div className="inline-actions">
                    <Button variant="ghost" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      Prev
                    </Button>
                    <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="mobile-table">
              <div className="mobile-card-grid">
                {loadingAssets
                  ? Array.from({ length: 4 }).map((_, idx) => (
                      <Card key={idx} title="">
                        <Skeleton height={16} />
                        <Skeleton height={16} width="80%" />
                      </Card>
                    ))
                  : pageAssets.map((asset) => (
                      <Card
                        key={asset.id}
                        title={`${asset.name} (${asset.symbol})`}
                        subtitle={`Rank #${asset.rank}`}
                        actions={
                          <span className={classNames('pill', asset.change24hPct >= 0 ? 'pill-success' : 'pill-danger')}>
                            {formatPercent(asset.change24hPct)}
                          </span>
                        }
                      >
                        <div className="inline-actions" style={{ justifyContent: 'space-between' }}>
                          <div>
                            <div>{formatCurrency(asset.price)}</div>
                            <div className="section-subtitle">MCap {formatCurrency(asset.marketCap)}</div>
                          </div>
                          <Sparkline data={asset.sparkline} color={asset.change7dPct >= 0 ? 'var(--color-success-500)' : 'var(--color-danger-500)'} />
                        </div>
                        <Button variant="ghost" onClick={() => openAsset(asset)}>
                          View details
                        </Button>
                      </Card>
                    ))}
              </div>
              {!loadingAssets && (
                <div className="inline-actions" style={{ justifyContent: 'space-between', marginTop: 12 }}>
                  <span className="section-subtitle">
                    Page {page} of {totalPages}
                  </span>
                  <div className="inline-actions">
                    <Button variant="ghost" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      Prev
                    </Button>
                    <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card title="Top gainers" subtitle="24h change leaders">
            {loadingAssets ? (
              <Skeleton height={18} />
            ) : (
              <ul className="list">
                {topGainers.map((asset) => (
                  <li key={asset.id} className="list-item">
                    <span>
                      {asset.name} ({asset.symbol})
                    </span>
                    <span className="pill pill-success">{formatPercent(asset.change24hPct)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Top losers" subtitle="24h pullbacks">
            {loadingAssets ? (
              <Skeleton height={18} />
            ) : (
              <ul className="list">
                {topLosers.map((asset) => (
                  <li key={asset.id} className="list-item">
                    <span>
                      {asset.name} ({asset.symbol})
                    </span>
                    <span className="pill pill-danger">{formatPercent(asset.change24hPct)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Movers (API)" subtitle="From /api/crypto/top when available">
            {loadingAssets ? (
              <Skeleton height={18} />
            ) : (
              <ul className="list">
                {topMovers.slice(0, 5).map((asset) => (
                  <li key={asset.id} className="list-item">
                    <span>
                      {asset.name} ({asset.symbol})
                    </span>
                    <span className={classNames('pill', asset.change24hPct >= 0 ? 'pill-success' : 'pill-danger')}>
                      {formatPercent(asset.change24hPct)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Modal
        open={Boolean(selectedAsset)}
        onClose={() => setSelectedAsset(null)}
        title={selectedAsset ? `${selectedAsset.name} (${selectedAsset.symbol})` : ''}
        actions={
          selectedAsset && (
            <div className="inline-actions">
              {[7, 30, 365].map((range) => (
                <Button key={range} variant={historyRange === range ? 'primary' : 'ghost'} onClick={() => setHistoryRange(range)}>
                  {range === 365 ? '1y' : `${range}d`}
                </Button>
              ))}
            </div>
          )
        }
      >
        {selectedAsset && (
          <div style={{ display: 'grid', gap: 12 }}>
            <div className="inline-actions" style={{ justifyContent: 'space-between' }}>
              <div>
                <strong style={{ fontSize: 24 }}>{formatCurrency(selectedAsset.price)}</strong>
                <div className="section-subtitle">Rank #{selectedAsset.rank}</div>
              </div>
              <span className={classNames('pill', selectedAsset.change24hPct >= 0 ? 'pill-success' : 'pill-danger')}>
                {formatPercent(selectedAsset.change24hPct)} (24h)
              </span>
            </div>

            {historyError && <div className="section-subtitle error">{historyError}</div>}
            {loadingHistory ? <Skeleton height={260} /> : <HistoryChart data={historyData} />}

            <div className="metric-grid">
              <Card title="Market cap" subtitle="">
                {formatCurrency(selectedAsset.marketCap)}
              </Card>
              <Card title="24h volume" subtitle="">
                {formatCurrency(selectedAsset.volume24h)}
              </Card>
              <Card title="7d change" subtitle="">
                <span className={classNames('pill', selectedAsset.change7dPct >= 0 ? 'pill-success' : 'pill-danger')}>
                  {formatPercent(selectedAsset.change7dPct)}
                </span>
              </Card>
            </div>
          </div>
        )}
      </Modal>

      {showToast && <Toast message="Data refreshed. Live prices will keep streaming." type="success" onClose={() => setShowToast(false)} />}
    </div>
  );
}
