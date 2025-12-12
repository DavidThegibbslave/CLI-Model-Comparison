// API Response Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'User' | 'Admin';
  createdAt: string;
  lastLogin?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface CryptoMarketData {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  circulatingSupply: number;
  totalSupply?: number;
  high24h: number;
  low24h: number;
  lastUpdated: string;
}

export interface CryptoDetail extends CryptoMarketData {
  description?: string;
  priceChangePercentage7d?: number;
  priceChangePercentage30d?: number;
  priceChangePercentage1y?: number;
  allTimeHigh?: number;
  allTimeHighDate?: string;
  allTimeLow?: number;
  allTimeLowDate?: string;
  maxSupply?: number;
}

export interface HistoricalPrice {
  timestamp: string;
  price: number;
}

export interface CryptoHistory {
  id: string;
  symbol: string;
  name: string;
  prices: HistoricalPrice[];
  marketCaps?: Array<{ timestamp: string; marketCap: number }>;
  volumes?: Array<{ timestamp: string; volume: number }>;
}

export interface CartItem {
  id: string;
  cryptoId: string;
  symbol: string;
  name: string;
  amount: number;
  priceAtAdd: number;
  currentPrice: number;
  subtotal: number;
  priceChange: number;
  priceChangePercentage: number;
  addedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

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

export interface Transaction {
  id: string;
  cryptoId: string;
  symbol: string;
  name: string;
  type: 'Buy' | 'Sell';
  amount: number;
  priceAtTransaction: number;
  totalValue: number;
  transactionDate: string;
}

export interface PortfolioPerformance {
  totalValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  totalHoldings: number;
  totalTransactions: number;
  bestPerformer?: CryptoHolding;
  worstPerformer?: CryptoHolding;
  allocations: Array<{
    cryptoId: string;
    symbol: string;
    name: string;
    value: number;
    percentage: number;
  }>;
}

export interface PriceAlert {
  id: string;
  cryptoId: string;
  symbol: string;
  name: string;
  targetPrice: number;
  isAbove: boolean;
  isActive: boolean;
  isTriggered: boolean;
  createdAt: string;
  triggeredAt?: string;
  currentPrice?: number;
}

export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalCount: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
    timestamp: string;
    path: string;
  };
}

// SignalR Message Types
export interface PriceUpdateMessage {
  timestamp: string;
  prices: Array<{
    id: string;
    symbol: string;
    name: string;
    currentPrice: number;
    priceChange24h: number;
    priceChangePercentage24h: number;
    marketCap: number;
    volume24h: number;
  }>;
}

export interface PortfolioUpdateMessage {
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
}

// Component Props Types
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'search';
export type InputSize = 'sm' | 'md' | 'lg';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
