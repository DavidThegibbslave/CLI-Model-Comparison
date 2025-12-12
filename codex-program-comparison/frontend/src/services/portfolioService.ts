import { apiClient } from './apiClient';
import { sampleAssets } from './sampleData';
import type { AlertRule, Portfolio, Position } from '../types/portfolio';

const PORTFOLIO_KEY = 'cm_portfolios';
const ALERTS_KEY = 'cm_alerts';

function getSamplePortfolio(): Portfolio {
  const btc = sampleAssets.find((a) => a.id === 'bitcoin')!;
  const eth = sampleAssets.find((a) => a.id === 'ethereum')!;
  const sol = sampleAssets.find((a) => a.id === 'solana')!;
  const positions: Position[] = [
    { id: 'p1', cryptoAssetId: btc.id, symbol: btc.symbol, name: btc.name, quantity: 0.65, avgPrice: 60000, currentPrice: btc.price },
    { id: 'p2', cryptoAssetId: eth.id, symbol: eth.symbol, name: eth.name, quantity: 3.1, avgPrice: 2900, currentPrice: eth.price },
    { id: 'p3', cryptoAssetId: sol.id, symbol: sol.symbol, name: sol.name, quantity: 12, avgPrice: 115, currentPrice: sol.price },
  ];
  const totalValue = positions.reduce((sum, p) => sum + p.quantity * p.currentPrice, 0);
  const pnl = positions.reduce((sum, p) => sum + p.quantity * (p.currentPrice - p.avgPrice), 0);
  return {
    id: 'demo',
    name: 'Long-term',
    riskTolerance: 'medium',
    positions,
    totalValue,
    pnl,
  };
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export async function fetchPortfolios(): Promise<Portfolio[]> {
  try {
    const { data } = await apiClient.get('/api/portfolio');
    return (data as any[]).map((p) => ({
      id: p.id,
      name: p.name,
      riskTolerance: p.riskTolerance,
      positions: (p.positions ?? []).map((pos: any) => ({
        id: pos.id,
        cryptoAssetId: pos.cryptoAssetId,
        symbol: pos.symbol ?? pos.cryptoAssetId,
        name: pos.name ?? pos.cryptoAssetId,
        quantity: Number(pos.quantity ?? 0),
        avgPrice: Number(pos.avgPrice ?? 0),
        currentPrice: Number(pos.currentPrice ?? pos.avgPrice ?? 0),
      })),
      totalValue: Number(p.totalValue ?? 0),
      pnl: Number(p.pnl ?? 0),
    }));
  } catch {
    const cached = readLocal<Portfolio[]>(PORTFOLIO_KEY, [getSamplePortfolio()]);
    return cached;
  }
}

export async function savePortfolio(portfolio: Portfolio): Promise<Portfolio[]> {
  try {
    const { data } = await apiClient.post('/api/portfolio', { name: portfolio.name, riskTolerance: portfolio.riskTolerance });
    return data;
  } catch {
    const existing = readLocal<Portfolio[]>(PORTFOLIO_KEY, [getSamplePortfolio()]);
    const next = [...existing, { ...portfolio, id: `local-${Date.now()}` }];
    writeLocal(PORTFOLIO_KEY, next);
    return next;
  }
}

export async function upsertPosition(portfolioId: string, position: Omit<Position, 'id' | 'name' | 'currentPrice'>): Promise<Portfolio[]> {
  try {
    const { data } = await apiClient.post(`/api/portfolio/${portfolioId}/positions`, position);
    return data;
  } catch {
    const portfolios = readLocal<Portfolio[]>(PORTFOLIO_KEY, [getSamplePortfolio()]);
    const updated = portfolios.map((pf) => {
      if (pf.id !== portfolioId) return pf;
      const asset = sampleAssets.find((a) => a.id === position.cryptoAssetId) || sampleAssets[0];
      const existing = pf.positions.find((p) => p.cryptoAssetId === position.cryptoAssetId);
      const nextPosition: Position = existing
        ? { ...existing, quantity: position.quantity, avgPrice: position.avgPrice }
        : {
            id: `pos-${Date.now()}`,
            cryptoAssetId: position.cryptoAssetId,
            symbol: asset.symbol,
            name: asset.name,
            quantity: position.quantity,
            avgPrice: position.avgPrice,
            currentPrice: asset.price,
          };
      const positions = existing
        ? pf.positions.map((p) => (p.cryptoAssetId === position.cryptoAssetId ? nextPosition : p))
        : [...pf.positions, nextPosition];
      const totalValue = positions.reduce((sum, p) => sum + p.quantity * p.currentPrice, 0);
      const pnl = positions.reduce((sum, p) => sum + p.quantity * (p.currentPrice - p.avgPrice), 0);
      return { ...pf, positions, totalValue, pnl };
    });
    writeLocal(PORTFOLIO_KEY, updated);
    return updated;
  }
}

export async function removePosition(portfolioId: string, positionId: string): Promise<Portfolio[]> {
  try {
    const { data } = await apiClient.delete(`/api/portfolio/${portfolioId}/positions/${positionId}`);
    return data;
  } catch {
    const portfolios = readLocal<Portfolio[]>(PORTFOLIO_KEY, [getSamplePortfolio()]);
    const updated = portfolios.map((pf) => {
      if (pf.id !== portfolioId) return pf;
      const positions = pf.positions.filter((p) => p.id !== positionId);
      const totalValue = positions.reduce((sum, p) => sum + p.quantity * p.currentPrice, 0);
      const pnl = positions.reduce((sum, p) => sum + p.quantity * (p.currentPrice - p.avgPrice), 0);
      return { ...pf, positions, totalValue, pnl };
    });
    writeLocal(PORTFOLIO_KEY, updated);
    return updated;
  }
}

export async function fetchAlerts(): Promise<AlertRule[]> {
  try {
    const { data } = await apiClient.get('/api/alerts');
    return (data as any[]).map((a) => ({
      id: a.id,
      cryptoAssetId: a.cryptoAssetId,
      symbol: a.symbol ?? a.cryptoAssetId,
      conditionType: a.conditionType,
      direction: a.direction,
      thresholdValue: Number(a.thresholdValue ?? 0),
      channel: a.channel ?? 'email',
    }));
  } catch {
    return readLocal<AlertRule[]>(ALERTS_KEY, [
      { id: 'alert1', cryptoAssetId: 'bitcoin', symbol: 'BTC', conditionType: 'price_up', direction: 'above', thresholdValue: 65000, channel: 'email' },
      { id: 'alert2', cryptoAssetId: 'ethereum', symbol: 'ETH', conditionType: 'price_down', direction: 'below', thresholdValue: 2800, channel: 'push' },
    ]);
  }
}

export async function createAlert(rule: Omit<AlertRule, 'id' | 'symbol'>): Promise<AlertRule[]> {
  try {
    const { data } = await apiClient.post('/api/alerts', rule);
    return data;
  } catch {
    const existing = readLocal<AlertRule[]>(ALERTS_KEY, []);
    const asset = sampleAssets.find((a) => a.id === rule.cryptoAssetId);
    const next: AlertRule = {
      ...rule,
      id: `alert-${Date.now()}`,
      symbol: asset?.symbol ?? rule.cryptoAssetId,
    };
    const updated = [...existing, next];
    writeLocal(ALERTS_KEY, updated);
    return updated;
  }
}

export async function deleteAlert(id: string): Promise<AlertRule[]> {
  try {
    const { data } = await apiClient.delete(`/api/alerts/${id}`);
    return data;
  } catch {
    const existing = readLocal<AlertRule[]>(ALERTS_KEY, []);
    const updated = existing.filter((a) => a.id !== id);
    writeLocal(ALERTS_KEY, updated);
    return updated;
  }
}
