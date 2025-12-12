import React, { useState, useMemo } from 'react';
import { CryptoMarketData } from '@/types';
import { Card, CardContent, TableSkeleton } from '@/components/ui';

interface CryptoTableProps {
  data: CryptoMarketData[];
  isLoading?: boolean;
  onRowClick?: (crypto: CryptoMarketData) => void;
  priceFlashes?: Record<string, 'up' | 'down'>;
}

type SortField = 'marketCapRank' | 'name' | 'currentPrice' | 'priceChangePercentage24h' | 'marketCap' | 'volume24h';
type SortOrder = 'asc' | 'desc';

/**
 * Format number as currency
 */
const formatCurrency = (value: number): string => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

/**
 * Format price based on value
 */
const formatPrice = (value: number): string => {
  if (value >= 1) return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(8)}`;
};

export const CryptoTable: React.FC<CryptoTableProps> = ({
  data,
  isLoading = false,
  onRowClick,
  priceFlashes = {},
}) => {
  const [sortField, setSortField] = useState<SortField>('marketCapRank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Handle column sort
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field - default to ascending (except for rank)
      setSortField(field);
      setSortOrder(field === 'marketCapRank' ? 'asc' : 'desc');
    }
  };

  /**
   * Sort and filter data
   */
  const sortedData = useMemo(() => {
    let filtered = data;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = data.filter(
        (crypto) =>
          crypto.name.toLowerCase().includes(term) ||
          crypto.symbol.toLowerCase().includes(term)
      );
    }

    // Sort
    return [...filtered].sort((a, b) => {
      let aVal: number | string = a[sortField];
      let bVal: number | string = b[sortField];

      // Handle string sorting (name)
      if (sortField === 'name') {
        return sortOrder === 'asc'
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }

      // Handle number sorting
      const aNum = aVal as number;
      const bNum = bVal as number;
      return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
    });
  }, [data, searchTerm, sortField, sortOrder]);

  /**
   * Sort icon component
   */
  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return null;

    return (
      <span className="ml-1 inline-block">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <TableSkeleton rows={10} columns={7} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleSort('marketCapRank')}
                >
                  Rank <SortIcon field="marketCapRank" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  Name <SortIcon field="name" />
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleSort('currentPrice')}
                >
                  Price <SortIcon field="currentPrice" />
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleSort('priceChangePercentage24h')}
                >
                  24h % <SortIcon field="priceChangePercentage24h" />
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleSort('marketCap')}
                >
                  Market Cap <SortIcon field="marketCap" />
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleSort('volume24h')}
                >
                  Volume (24h) <SortIcon field="volume24h" />
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Chart (7d)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {sortedData.map((crypto) => {
                const isPositive = crypto.priceChangePercentage24h >= 0;
                const flash = priceFlashes[crypto.id];

                return (
                  <tr
                    key={crypto.id}
                    onClick={() => onRowClick?.(crypto)}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-300 ${
                      flash === 'up'
                        ? 'animate-flash-green'
                        : flash === 'down'
                        ? 'animate-flash-red'
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {crypto.marketCapRank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {crypto.image && (
                          <img
                            src={crypto.image}
                            alt={crypto.name}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {crypto.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                            {crypto.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatPrice(crypto.currentPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <span
                        className={
                          isPositive
                            ? 'text-success-600 dark:text-success-400'
                            : 'text-danger-600 dark:text-danger-400'
                        }
                      >
                        {isPositive ? '+' : ''}
                        {crypto.priceChangePercentage24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(crypto.marketCap)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(crypto.volume24h)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="w-24 h-12 ml-auto">
                        {/* Sparkline chart will go here */}
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400">
                          Chart
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-800">
          {sortedData.map((crypto) => {
            const isPositive = crypto.priceChangePercentage24h >= 0;
            const flash = priceFlashes[crypto.id];

            return (
              <div
                key={crypto.id}
                onClick={() => onRowClick?.(crypto)}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-300 ${
                  flash === 'up'
                    ? 'animate-flash-green'
                    : flash === 'down'
                    ? 'animate-flash-red'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    {crypto.image && (
                      <img
                        src={crypto.image}
                        alt={crypto.name}
                        className="w-10 h-10 rounded-full mr-3 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          #{crypto.marketCapRank}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {crypto.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        {crypto.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatPrice(crypto.currentPrice)}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        isPositive
                          ? 'text-success-600 dark:text-success-400'
                          : 'text-danger-600 dark:text-danger-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {crypto.priceChangePercentage24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Market Cap</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(crypto.marketCap)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Volume (24h)</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(crypto.volume24h)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {sortedData.length === 0 && !isLoading && (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No cryptocurrencies found matching your search.' : 'No data available.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
