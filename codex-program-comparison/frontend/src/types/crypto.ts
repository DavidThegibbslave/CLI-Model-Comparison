export type CryptoAsset = {
  id: string;
  symbol: string;
  name: string;
  rank: number;
  price: number;
  change24hPct: number;
  change7dPct: number;
  marketCap: number;
  volume24h: number;
  sparkline: Array<{ t: number; v: number }>;
};

export type MarketStats = {
  totalMarketCap: number;
  volume24h: number;
  btcDominance: number;
  fearGreedIndex?: number;
};

export type MarketUpdate = {
  id: string;
  price: number;
  change24hPct: number;
  change7dPct?: number;
  volume24h?: number;
};
