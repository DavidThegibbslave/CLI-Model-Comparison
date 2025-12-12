import { ApiService } from './api';
import { CryptoMarketData, CryptoDetail, CryptoHistory, PaginationMeta } from '@/types';

/**
 * Crypto Service
 *
 * Handles all cryptocurrency-related API calls
 */

export interface MarketsResponse {
  data: CryptoMarketData[];
  pagination: PaginationMeta;
}

export interface MarketsParams {
  page?: number;
  perPage?: number;
  sortBy?: 'market_cap' | 'price' | 'volume' | 'price_change_24h';
  sortOrder?: 'asc' | 'desc';
}

export interface CompareParams {
  ids: string[];
}

export class CryptoService {
  /**
   * Get list of cryptocurrencies with market data
   */
  static async getMarkets(params?: MarketsParams): Promise<MarketsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.perPage) queryParams.append('perPage', params.perPage.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const query = queryParams.toString();
    const url = `/crypto/markets${query ? `?${query}` : ''}`;

    const response = await ApiService.get<MarketsResponse | CryptoMarketData[]>(url);
    const payload = response.data;

    // Backend returns a flat array; normalize into MarketsResponse
    if (Array.isArray(payload)) {
      return {
        data: payload,
        pagination: {
          page: params?.page ?? 1,
          perPage: params?.perPage ?? payload.length,
          total: payload.length,
          totalPages: 1,
        },
      };
    }

    return payload;
  }

  /**
   * Get detailed information about a specific cryptocurrency
   */
  static async getCryptoDetail(cryptoId: string): Promise<CryptoDetail> {
    const response = await ApiService.get<CryptoDetail>(`/crypto/${cryptoId}`);
    return response.data;
  }

  /**
   * Get historical price data for a cryptocurrency
   */
  static async getCryptoHistory(
    cryptoId: string,
    days: number = 7
  ): Promise<CryptoHistory> {
    const response = await ApiService.get<CryptoHistory>(
      `/crypto/${cryptoId}/history?days=${days}`
    );
    return response.data;
  }

  /**
   * Compare multiple cryptocurrencies
   */
  static async compareCryptos(ids: string[]): Promise<CryptoMarketData[]> {
    const idsParam = ids.join(',');
    const response = await ApiService.get<{ cryptocurrencies: CryptoMarketData[] }>(
      `/crypto/compare?ids=${idsParam}`
    );
    return response.data.cryptocurrencies;
  }

  /**
   * Get top gainers and losers
   */
  static async getTopMovers(): Promise<{
    gainers: CryptoMarketData[];
    losers: CryptoMarketData[];
  }> {
    const response = await ApiService.get<
      { gainers: CryptoMarketData[]; losers: CryptoMarketData[] } | CryptoMarketData[]
    >('/crypto/top');

    const data = response.data;

    // Backend currently returns a flat array sorted by 24h change.
    // Normalize into { gainers, losers } so the UI code stays consistent.
    if (Array.isArray(data)) {
      const sorted = [...data].filter((d) => typeof d.priceChangePercentage24h === 'number');
      const gainers = [...sorted]
        .sort((a, b) => (b.priceChangePercentage24h ?? 0) - (a.priceChangePercentage24h ?? 0))
        .slice(0, 5);
      const losers = [...sorted]
        .sort((a, b) => (a.priceChangePercentage24h ?? 0) - (b.priceChangePercentage24h ?? 0))
        .slice(0, 5);

      return { gainers, losers };
    }

    return {
      gainers: Array.isArray(data.gainers) ? data.gainers : [],
      losers: Array.isArray(data.losers) ? data.losers : [],
    };
  }
}
