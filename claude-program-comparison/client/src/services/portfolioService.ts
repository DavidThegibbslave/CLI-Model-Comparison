import { ApiService } from './api';

/**
 * Transaction types
 */
export enum TransactionType {
  Buy = 0,
  Sell = 1,
}

/**
 * Transaction DTO
 */
export interface Transaction {
  id: string;
  cryptoId: string;
  symbol: string;
  name: string;
  type: TransactionType;
  amount: number;
  priceAtTransaction: number;
  totalValue: number;
  transactionDate: string;
}

/**
 * Crypto Holding DTO
 */
export interface CryptoHolding {
  id: string;
  cryptoId: string;
  symbol: string;
  name: string;
  amount: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  firstPurchaseDate: string;
  lastUpdated: string;
}

/**
 * Portfolio DTO
 */
export interface Portfolio {
  id: string;
  userId: string;
  totalValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  holdings: CryptoHolding[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Holding Allocation for pie chart
 */
export interface HoldingAllocation {
  cryptoId: string;
  symbol: string;
  name: string;
  value: number;
  percentage: number;
}

/**
 * Portfolio Performance DTO
 */
export interface PortfolioPerformance {
  totalValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  totalHoldings: number;
  totalTransactions: number;
  bestPerformer: CryptoHolding | null;
  worstPerformer: CryptoHolding | null;
  allocations: HoldingAllocation[];
}

/**
 * Portfolio API Service
 */
export class PortfolioService {
  /**
   * Get user's portfolio with all holdings
   */
  static async getPortfolio(): Promise<Portfolio> {
    const response = await ApiService.get<Portfolio>('/portfolio');
    return response.data;
  }

  /**
   * Get portfolio performance metrics
   */
  static async getPerformance(): Promise<PortfolioPerformance> {
    const response = await ApiService.get<PortfolioPerformance>('/portfolio/performance');
    return response.data;
  }

  /**
   * Get user's transaction history with pagination
   */
  static async getTransactions(page: number = 1, pageSize: number = 20): Promise<Transaction[]> {
    const response = await ApiService.get<Transaction[]>('/portfolio/transactions', {
      params: { page, pageSize },
    });
    return response.data;
  }

  /**
   * Get specific crypto holding
   */
  static async getHolding(cryptoId: string): Promise<CryptoHolding> {
    const response = await ApiService.get<CryptoHolding>(`/portfolio/holdings/${cryptoId}`);
    return response.data;
  }
}
