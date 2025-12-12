import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { CryptoHolding } from '@/services/portfolioService';

interface HoldingsTableProps {
  holdings: CryptoHolding[];
  onHoldingClick?: (holding: CryptoHolding) => void;
}

type SortField = 'name' | 'amount' | 'currentValue' | 'profitLoss' | 'profitLossPercentage';
type SortOrder = 'asc' | 'desc';

/**
 * Format price
 */
const formatPrice = (value: number): string => {
  if (value >= 1) return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(8)}`;
};

/**
 * Format crypto amount
 */
const formatAmount = (value: number): string => {
  if (value >= 1) return value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return value.toFixed(8);
};

/**
 * Holdings table component
 */
export const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings, onHoldingClick }) => {
  const [sortField, setSortField] = useState<SortField>('currentValue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'currentValue':
          aValue = a.currentValue;
          bValue = b.currentValue;
          break;
        case 'profitLoss':
          aValue = a.profitLoss;
          bValue = b.profitLoss;
          break;
        case 'profitLossPercentage':
          aValue = a.profitLossPercentage;
          bValue = b.profitLossPercentage;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      const aNum = Number(aValue);
      const bNum = Number(bValue);
      return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
    });
  }, [holdings, sortField, sortOrder]);

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (holdings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Holdings Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Purchase cryptocurrency from the store to start building your portfolio
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holdings ({holdings.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th
                  className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Asset
                    <SortIcon field="name" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Amount
                    <SortIcon field="amount" />
                  </div>
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg. Buy Price
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Current Price
                </th>
                <th
                  className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                  onClick={() => handleSort('currentValue')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Value
                    <SortIcon field="currentValue" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                  onClick={() => handleSort('profitLoss')}
                >
                  <div className="flex items-center justify-end gap-2">
                    P&L
                    <SortIcon field="profitLoss" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
                  onClick={() => handleSort('profitLossPercentage')}
                >
                  <div className="flex items-center justify-end gap-2">
                    P&L %
                    <SortIcon field="profitLossPercentage" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedHoldings.map((holding) => {
                const isPositive = holding.profitLoss >= 0;
                return (
                  <tr
                    key={holding.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => onHoldingClick?.(holding)}
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{holding.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">{holding.symbol}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-gray-900 dark:text-gray-100">
                      {formatAmount(holding.amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-gray-600 dark:text-gray-400">
                      {formatPrice(holding.averageBuyPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-gray-600 dark:text-gray-400">
                      {formatPrice(holding.currentPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-gray-100">
                      {formatPrice(holding.currentValue)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-medium ${
                        isPositive ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {formatPrice(holding.profitLoss)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold ${
                        isPositive ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {holding.profitLossPercentage.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {sortedHoldings.map((holding) => {
            const isPositive = holding.profitLoss >= 0;
            return (
              <div
                key={holding.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                onClick={() => onHoldingClick?.(holding)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{holding.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">{holding.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {formatPrice(holding.currentValue)}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        isPositive ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {holding.profitLossPercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Amount</p>
                    <p className="font-mono text-gray-900 dark:text-gray-100">{formatAmount(holding.amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 dark:text-gray-400">Current Price</p>
                    <p className="font-mono text-gray-900 dark:text-gray-100">{formatPrice(holding.currentPrice)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
