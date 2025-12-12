import { apiClient } from './apiClient';
import { sampleAssets, sampleMarketStats, generateHistory } from './sampleData';
import type { CryptoAsset, MarketStats } from '../types/crypto';

function normalizeAsset(item: any, index: number): CryptoAsset {
  return {
    id: item.id ?? item.symbol ?? `asset-${index}`,
    symbol: (item.symbol ?? '').toUpperCase(),
    name: item.name ?? item.id ?? 'Unknown',
    rank: item.market_cap_rank ?? item.rank ?? index + 1,
    price: Number(item.current_price ?? item.price ?? 0),
    change24hPct: Number(item.price_change_percentage_24h ?? item.change24hPct ?? 0),
    change7dPct: Number(item.price_change_percentage_7d_in_currency ?? item.change7dPct ?? 0),
    marketCap: Number(item.market_cap ?? item.marketCap ?? 0),
    volume24h: Number(item.total_volume ?? item.volume24h ?? 0),
    sparkline:
      item.sparkline_in_7d?.price?.map((v: number, idx: number) => ({
        t: Date.now() - (item.sparkline_in_7d.price.length - idx) * 3600_000,
        v: Number(v),
      })) ?? item.sparkline ?? [],
  };
}

export async function fetchCryptoList(): Promise<CryptoAsset[]> {
  try {
    const { data } = await apiClient.get('/api/crypto/list');
    return (data as any[]).map(normalizeAsset);
  } catch {
    return sampleAssets;
  }
}

export async function fetchTopMovers(): Promise<CryptoAsset[]> {
  try {
    const { data } = await apiClient.get('/api/crypto/top');
    return (data as any[]).map(normalizeAsset);
  } catch {
    return [...sampleAssets].sort((a, b) => b.change24hPct - a.change24hPct).slice(0, 6);
  }
}

export async function fetchMarketStats(): Promise<MarketStats> {
  try {
    const { data } = await apiClient.get('/api/crypto/markets/live');
    return {
      totalMarketCap: Number(data.totalMarketCap ?? data.total_market_cap ?? sampleMarketStats.totalMarketCap),
      volume24h: Number(data.volume24h ?? data.volume_24h ?? sampleMarketStats.volume24h),
      btcDominance: Number(data.btcDominance ?? data.btc_dominance ?? sampleMarketStats.btcDominance),
      fearGreedIndex: Number(data.fearGreedIndex ?? data.fear_greed ?? sampleMarketStats.fearGreedIndex),
    };
  } catch {
    return sampleMarketStats;
  }
}

export async function fetchHistory(assetId: string, days: number) {
  try {
    const { data } = await apiClient.get(`/api/crypto/${assetId}/history`, { params: { days } });
    return (data as any[]).map((p) => ({
      timestamp: Number(p.timestamp ?? p[0] ?? Date.now()),
      price: Number(p.price ?? p[1] ?? 0),
    }));
  } catch {
    return generateHistory(assetId, days);
  }
}
