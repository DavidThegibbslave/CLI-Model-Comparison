import React, { useState } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { HistoricalPrice } from '@/types';
import { Button, Loading } from '@/components/ui';

interface PriceChartProps {
  data: HistoricalPrice[];
  symbol: string;
  isLoading?: boolean;
  showTimeRangeSelector?: boolean;
  onTimeRangeChange?: (days: number) => void;
  selectedTimeRange?: number;
}

type TimeRange = 1 | 7 | 30 | 90 | 365;

/**
 * Format price for display
 */
const formatPrice = (value: number): string => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  if (value >= 1) {
    return `$${value.toFixed(2)}`;
  }
  return `$${value.toFixed(6)}`;
};

/**
 * Format date based on time range
 */
const formatDate = (timestamp: string, timeRange: number): string => {
  const date = new Date(timestamp);

  if (timeRange === 1) {
    // 1 day - show hour
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } else if (timeRange <= 7) {
    // 7 days - show day and time
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (timeRange <= 90) {
    // 90 days - show month and day
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else {
    // 1 year+ - show month and year
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
};

/**
 * Custom tooltip component
 */
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;
  const price = data.price;
  const timestamp = new Date(data.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{timestamp}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
        {formatPrice(price)}
      </p>
    </div>
  );
};

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  symbol,
  isLoading = false,
  showTimeRangeSelector = true,
  onTimeRangeChange,
  selectedTimeRange = 7,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>(selectedTimeRange as TimeRange);

  const timeRanges: TimeRange[] = [1, 7, 30, 90, 365];
  const timeRangeLabels: Record<TimeRange, string> = {
    1: '24H',
    7: '7D',
    30: '30D',
    90: '90D',
    365: '1Y',
  };

  /**
   * Handle time range change
   */
  const handleTimeRangeChange = (days: TimeRange) => {
    setTimeRange(days);
    onTimeRangeChange?.(days);
  };

  /**
   * Determine if price is going up or down
   */
  const isPositive = data.length > 1 && data[data.length - 1].price >= data[0].price;

  /**
   * Format data for chart
   */
  const chartData = data.map((item) => ({
    timestamp: item.timestamp,
    price: item.price,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading text="Loading chart data..." />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No chart data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Time Range Selector */}
      {showTimeRangeSelector && (
        <div className="flex items-center justify-center gap-2">
          {timeRanges.map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleTimeRangeChange(range)}
            >
              {timeRangeLabels[range]}
            </Button>
          ))}
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`colorPrice-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isPositive ? '#22c55e' : '#ef4444'}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={isPositive ? '#22c55e' : '#ef4444'}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(timestamp) => formatDate(timestamp, timeRange)}
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            tickFormatter={formatPrice}
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            domain={['dataMin', 'dataMax']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={isPositive ? '#22c55e' : '#ef4444'}
            strokeWidth={2}
            fill={`url(#colorPrice-${symbol})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Price Info */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          {symbol.toUpperCase()} Price Chart
        </span>
        <span
          className={`font-medium ${
            isPositive
              ? 'text-success-600 dark:text-success-400'
              : 'text-danger-600 dark:text-danger-400'
          }`}
        >
          {isPositive ? '▲' : '▼'}{' '}
          {(
            ((data[data.length - 1].price - data[0].price) / data[0].price) *
            100
          ).toFixed(2)}
          %
        </span>
      </div>
    </div>
  );
};
