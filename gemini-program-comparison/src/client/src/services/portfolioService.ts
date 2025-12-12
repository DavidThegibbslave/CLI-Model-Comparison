import api from '@/lib/axios';

export interface Portfolio {
  id: string;
  name: string;
  balanceUsd: number;
  totalValueUsd: number;
  positions: Position[];
}

export interface Position {
  assetId: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

export interface Transaction {
    id: string;
    assetId: string;
    type: 'Buy' | 'Sell';
    quantity: number;
    priceAtTransaction: number;
    totalUsd: number;
    timestamp: string;
}

export const portfolioService = {
  getAll: async () => {
    const response = await api.get<Portfolio[]>('/portfolios');
    return response.data;
  },
  create: async (name: string) => {
    const response = await api.post<Portfolio>('/portfolios', { name });
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get<Portfolio>(`/portfolios/${id}`);
    return response.data;
  },
  buy: async (id: string, assetId: string, quantity: number) => {
    const response = await api.post(`/portfolios/${id}/buy`, { assetId, quantity });
    return response.data;
  },
  sell: async (id: string, assetId: string, quantity: number) => {
    const response = await api.post(`/portfolios/${id}/sell`, { assetId, quantity });
    return response.data;
  },
  getTransactions: async (id: string) => {
      const response = await api.get<Transaction[]>(`/portfolios/${id}/transactions`);
      return response.data;
  }
};
