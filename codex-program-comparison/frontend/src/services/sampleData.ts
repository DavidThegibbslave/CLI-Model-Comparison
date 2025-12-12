import type { CryptoAsset, MarketStats } from '../types/crypto';

const now = Date.now();

function generateSparkline(base: number) {
  const points = [];
  let price = base;
  for (let i = 20; i >= 0; i -= 1) {
    const delta = (Math.random() - 0.5) * (base * 0.004);
    price = Math.max(1, price + delta);
    points.unshift({ t: now - i * 60_000, v: parseFloat(price.toFixed(2)) });
  }
  return points;
}

export const sampleAssets: CryptoAsset[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    rank: 1,
    price: 62140,
    change24hPct: 1.4,
    change7dPct: 3.1,
    marketCap: 1.21e12,
    volume24h: 28.4e9,
    sparkline: generateSparkline(62140),
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    rank: 2,
    price: 3210,
    change24hPct: 1.9,
    change7dPct: 4.2,
    marketCap: 4.1e11,
    volume24h: 14.2e9,
    sparkline: generateSparkline(3210),
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    rank: 5,
    price: 142.1,
    change24hPct: 6.4,
    change7dPct: 11.2,
    marketCap: 62.4e9,
    volume24h: 3.1e9,
    sparkline: generateSparkline(142.1),
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    rank: 4,
    price: 518.4,
    change24hPct: 0.8,
    change7dPct: 2.1,
    marketCap: 79.3e9,
    volume24h: 1.8e9,
    sparkline: generateSparkline(518.4),
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'XRP',
    rank: 7,
    price: 1.14,
    change24hPct: -0.4,
    change7dPct: 0.8,
    marketCap: 52.4e9,
    volume24h: 1.2e9,
    sparkline: generateSparkline(1.14),
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    rank: 8,
    price: 0.74,
    change24hPct: 2.1,
    change7dPct: 3.3,
    marketCap: 25.2e9,
    volume24h: 0.88e9,
    sparkline: generateSparkline(0.74),
  },
  {
    id: 'polkadot',
    symbol: 'DOT',
    name: 'Polkadot',
    rank: 13,
    price: 9.12,
    change24hPct: -1.1,
    change7dPct: 1.6,
    marketCap: 12.4e9,
    volume24h: 0.42e9,
    sparkline: generateSparkline(9.12),
  },
  {
    id: 'chainlink',
    symbol: 'LINK',
    name: 'Chainlink',
    rank: 14,
    price: 16.9,
    change24hPct: 4.5,
    change7dPct: 7.4,
    marketCap: 10.2e9,
    volume24h: 0.61e9,
    sparkline: generateSparkline(16.9),
  },
  {
    id: 'avalanche-2',
    symbol: 'AVAX',
    name: 'Avalanche',
    rank: 10,
    price: 38.5,
    change24hPct: 3.2,
    change7dPct: 5.4,
    marketCap: 15.8e9,
    volume24h: 0.73e9,
    sparkline: generateSparkline(38.5),
  },
  {
    id: 'dogecoin',
    symbol: 'DOGE',
    name: 'Dogecoin',
    rank: 9,
    price: 0.18,
    change24hPct: -2.1,
    change7dPct: 1.1,
    marketCap: 25.9e9,
    volume24h: 0.95e9,
    sparkline: generateSparkline(0.18),
  },
  {
    id: 'litecoin',
    symbol: 'LTC',
    name: 'Litecoin',
    rank: 16,
    price: 95.3,
    change24hPct: 0.2,
    change7dPct: 0.9,
    marketCap: 7.1e9,
    volume24h: 0.42e9,
    sparkline: generateSparkline(95.3),
  },
];

export const sampleMarketStats: MarketStats = {
  totalMarketCap: 1.52e12,
  volume24h: 86.4e9,
  btcDominance: 52.4,
  fearGreedIndex: 62,
};

export function generateHistory(assetId: string, days: number) {
  const asset = sampleAssets.find((a) => a.id === assetId) || sampleAssets[0];
  const interval = days * 24;
  const nowTs = Date.now();
  const points: Array<{ timestamp: number; price: number }> = [];
  let price = asset.price;
  for (let i = interval; i >= 0; i -= 1) {
    const drift = (Math.random() - 0.5) * (asset.price * 0.002);
    price = Math.max(0.1, price + drift);
    points.push({ timestamp: nowTs - i * 60 * 60 * 1000, price: parseFloat(price.toFixed(2)) });
  }
  return points;
}
