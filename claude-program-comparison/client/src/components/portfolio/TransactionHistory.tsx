import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Loading } from '@/components/ui';
import { Transaction, TransactionType, PortfolioService } from '@/services/portfolioService';
import { useToast } from '@/contexts';

/**
 * Format price
 */
const formatPrice = (value: number): string => {
  if (value >= 1) return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(8)}`;
};

/**
 * Format amount
 */
const formatAmount = (value: number): string => {
  if (value >= 1) return value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return value.toFixed(8);
};

/**
 * Format date
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Transaction history component with pagination
 */
export const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { showError } = useToast();

  const PAGE_SIZE = 10;

  /**
   * Fetch transactions
   */
  const fetchTransactions = async (page: number, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const data = await PortfolioService.getTransactions(page, PAGE_SIZE);

      if (append) {
        setTransactions((prev) => [...prev, ...data]);
      } else {
        setTransactions(data);
      }

      // Check if there are more transactions
      setHasMore(data.length === PAGE_SIZE);
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      if (error.code !== 'HTTP_404') {
        showError('Error', 'Failed to load transactions');
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, []);

  /**
   * Load more transactions
   */
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchTransactions(nextPage, true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loading text="Loading transactions..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Transactions Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your transaction history will appear here once you make purchases
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History ({transactions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Asset</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Amount</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Price</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const isBuy = transaction.type === TransactionType.Buy;
                return (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(transaction.transactionDate)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          isBuy
                            ? 'bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400'
                            : 'bg-danger-100 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400'
                        }`}
                      >
                        {isBuy ? 'BUY' : 'SELL'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">{transaction.symbol}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-gray-900 dark:text-gray-100">
                      {formatAmount(transaction.amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-gray-600 dark:text-gray-400">
                      {formatPrice(transaction.priceAtTransaction)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-gray-100">
                      {formatPrice(transaction.totalValue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {transactions.map((transaction) => {
            const isBuy = transaction.type === TransactionType.Buy;
            return (
              <div
                key={transaction.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{transaction.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">{transaction.symbol}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      isBuy
                        ? 'bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400'
                        : 'bg-danger-100 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400'
                    }`}
                  >
                    {isBuy ? 'BUY' : 'SELL'}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatDate(transaction.transactionDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">{formatAmount(transaction.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Price</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">{formatPrice(transaction.priceAtTransaction)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Total</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{formatPrice(transaction.totalValue)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={handleLoadMore}
              isLoading={isLoadingMore}
              disabled={isLoadingMore}
            >
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
