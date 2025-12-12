export type Position = {
  id: string;
  cryptoAssetId: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
};

export type Portfolio = {
  id: string;
  name: string;
  riskTolerance?: string;
  positions: Position[];
  totalValue: number;
  pnl: number;
};

export type AlertRule = {
  id: string;
  cryptoAssetId: string;
  symbol: string;
  conditionType: string;
  direction: string;
  thresholdValue: number;
  channel: string;
};
