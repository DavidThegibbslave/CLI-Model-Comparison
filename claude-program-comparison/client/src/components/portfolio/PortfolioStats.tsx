import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { PortfolioPerformance } from '@/services/portfolioService';

interface PortfolioStatsProps {
  performance: PortfolioPerformance;
}

/**
 * Format price
 */
const formatPrice = (value: number): string => {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Portfolio statistics cards component
 */
export const PortfolioStats: React.FC<PortfolioStatsProps> = ({ performance }) => {
  const isProfitable = performance.totalProfitLoss >= 0;

  const stats = [
    {
      label: 'Total Value',
      value: formatPrice(performance.totalValue),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'text-primary-600 dark:text-primary-400',
      bgColor: 'bg-primary-100 dark:bg-primary-900/20',
    },
    {
      label: 'Total Invested',
      value: formatPrice(performance.totalInvested),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      color: 'text-secondary-600 dark:text-secondary-400',
      bgColor: 'bg-secondary-100 dark:bg-secondary-900/20',
    },
    {
      label: 'Total P&L',
      value: formatPrice(Math.abs(performance.totalProfitLoss)),
      subtitle: `${isProfitable ? '+' : ''}${performance.totalProfitLossPercentage.toFixed(2)}%`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={
              isProfitable
                ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
            }
          />
        </svg>
      ),
      color: isProfitable
        ? 'text-success-600 dark:text-success-400'
        : 'text-danger-600 dark:text-danger-400',
      bgColor: isProfitable
        ? 'bg-success-100 dark:bg-success-900/20'
        : 'bg-danger-100 dark:bg-danger-900/20',
    },
    {
      label: 'Total Holdings',
      value: performance.totalHoldings.toString(),
      subtitle: `${performance.totalTransactions} transactions`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                {stat.subtitle && (
                  <p className={`text-xs font-medium mt-1 ${stat.color}`}>{stat.subtitle}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
