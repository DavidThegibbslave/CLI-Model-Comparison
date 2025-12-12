import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { HoldingAllocation } from '@/services/portfolioService';

interface AllocationChartProps {
  allocations: HoldingAllocation[];
}

// Chart colors matching our design system
const COLORS = [
  '#3b82f6', // primary-500
  '#8b5cf6', // secondary-500
  '#10b981', // success-500
  '#f59e0b', // warning-500
  '#ef4444', // danger-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];

/**
 * Format price
 */
const formatPrice = (value: number): string => {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Custom tooltip for pie chart
 */
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="font-bold text-gray-900 dark:text-gray-100">{data.name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{data.symbol.toUpperCase()}</p>
        <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{formatPrice(data.value)}</p>
        <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
          {data.percentage.toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

/**
 * Portfolio allocation pie chart component
 */
export const AllocationChart: React.FC<AllocationChartProps> = ({ allocations }) => {
  if (allocations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No holdings to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = allocations.map((allocation) => ({
    name: allocation.name,
    symbol: allocation.symbol,
    value: allocation.value,
    percentage: allocation.percentage,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.percentage.toFixed(1)}%`}
                labelLine={true}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend with values */}
          <div className="space-y-2">
            {allocations.map((allocation, index) => (
              <div
                key={allocation.cryptoId}
                className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{allocation.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{allocation.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatPrice(allocation.value)}
                  </p>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                    {allocation.percentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
