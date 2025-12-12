import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Loading,
  Button,
  Input,
} from '@/components/ui';
import { CryptoMarketData, CryptoHistory } from '@/types';
import { CryptoService } from '@/services/cryptoService';
import { useToast } from '@/contexts';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * Format price
 */
const formatPrice = (value: number): string => {
  if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(6)}`;
};

/**
 * Format number
 */
const formatNumber = (value: number): string => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toLocaleString()}`;
};

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export const Compare: React.FC = () => {
  const [availableCryptos, setAvailableCryptos] = useState<CryptoMarketData[]>([]);
  const [selectedCryptos, setSelectedCryptos] = useState<CryptoMarketData[]>([]);
  const [historicalData, setHistoricalData] = useState<Record<string, CryptoHistory>>({});
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState(7);

  const { showError } = useToast();

  const MAX_SELECTION = 5;

  /**
   * Fetch available cryptos
   */
  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        setIsLoadingList(true);
        const data = await CryptoService.getMarkets({ perPage: 50, sortBy: 'market_cap', sortOrder: 'desc' });
        setAvailableCryptos(data.data);
      } catch (error) {
        console.error('Failed to fetch cryptos:', error);
        showError('Error', 'Failed to load cryptocurrencies');
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchCryptos();
  }, [showError]);

  /**
   * Fetch historical data when selection changes
   */
  useEffect(() => {
    if (selectedCryptos.length === 0) {
      setHistoricalData({});
      return;
    }

    const fetchHistoricalData = async () => {
      try {
        setIsLoadingHistory(true);
        const promises = selectedCryptos.map((crypto) =>
          CryptoService.getCryptoHistory(crypto.id, timeRange)
        );
        const results = await Promise.all(promises);

        const dataMap: Record<string, CryptoHistory> = {};
        results.forEach((result) => {
          dataMap[result.id] = result;
        });

        setHistoricalData(dataMap);
      } catch (error) {
        console.error('Failed to fetch historical data:', error);
        showError('Error', 'Failed to load historical data');
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistoricalData();
  }, [selectedCryptos, timeRange, showError]);

  /**
   * Toggle crypto selection
   */
  const handleToggleSelection = (crypto: CryptoMarketData) => {
    const isSelected = selectedCryptos.some((c) => c.id === crypto.id);

    if (isSelected) {
      setSelectedCryptos(selectedCryptos.filter((c) => c.id !== crypto.id));
    } else {
      if (selectedCryptos.length >= MAX_SELECTION) {
        showError('Maximum Reached', `You can only compare up to ${MAX_SELECTION} cryptocurrencies`);
        return;
      }
      setSelectedCryptos([...selectedCryptos, crypto]);
    }
  };

  /**
   * Prepare chart data
   */
  const chartData = React.useMemo(() => {
    if (Object.keys(historicalData).length === 0) return [];

    // Get all timestamps from the first crypto
    const firstCrypto = Object.values(historicalData)[0];
    if (!firstCrypto || !firstCrypto.prices) return [];

    return firstCrypto.prices.map((pricePoint, index) => {
      const dataPoint: any = {
        timestamp: pricePoint.timestamp,
        date: new Date(pricePoint.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      };

      // Add prices from all selected cryptos
      selectedCryptos.forEach((crypto) => {
        const history = historicalData[crypto.id];
        if (history && history.prices[index]) {
          dataPoint[crypto.id] = history.prices[index].price;
        }
      });

      return dataPoint;
    });
  }, [historicalData, selectedCryptos]);

  /**
   * Filter cryptos by search
   */
  const filteredCryptos = React.useMemo(() => {
    if (!searchTerm) return availableCryptos;

    const term = searchTerm.toLowerCase();
    return availableCryptos.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(term) || crypto.symbol.toLowerCase().includes(term)
    );
  }, [availableCryptos, searchTerm]);

  if (isLoadingList) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Compare Cryptocurrencies
        </h1>
        <div className="flex items-center justify-center py-20">
          <Loading text="Loading cryptocurrencies..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Compare Cryptocurrencies
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Select up to {MAX_SELECTION} cryptocurrencies to compare side-by-side
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crypto Selector */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                Select Cryptocurrencies ({selectedCryptos.length}/{MAX_SELECTION})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search */}
                <Input
                  inputType="search"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  inputSize="sm"
                />

                {/* Selected Cryptos */}
                {selectedCryptos.length > 0 && (
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Selected
                    </p>
                    <div className="space-y-2">
                      {selectedCryptos.map((crypto) => (
                        <div
                          key={crypto.id}
                          className="flex items-center justify-between p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {crypto.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                              {crypto.symbol}
                            </span>
                          </div>
                          <button
                            onClick={() => handleToggleSelection(crypto)}
                            className="text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Cryptos */}
                <div className="max-h-96 overflow-y-auto space-y-1">
                  {filteredCryptos.map((crypto) => {
                    const isSelected = selectedCryptos.some((c) => c.id === crypto.id);

                    return (
                      <button
                        key={crypto.id}
                        onClick={() => handleToggleSelection(crypto)}
                        disabled={isSelected}
                        className={`w-full text-left p-2 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {crypto.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                            {crypto.symbol}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatPrice(crypto.currentPrice)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison View */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCryptos.length === 0 ? (
            <Card>
              <CardContent>
                <div className="text-center py-12">
                  <svg
                    className="w-24 h-24 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Select Cryptocurrencies
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose 2 or more cryptocurrencies from the list to start comparing
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Price Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Price Comparison</CardTitle>
                    <div className="flex items-center gap-2">
                      {[1, 7, 30, 90].map((days) => (
                        <Button
                          key={days}
                          variant={timeRange === days ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setTimeRange(days)}
                        >
                          {days === 1 ? '24H' : `${days}D`}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingHistory ? (
                    <div className="flex items-center justify-center h-64">
                      <Loading text="Loading chart..." />
                    </div>
                  ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis
                          dataKey="date"
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis
                          tickFormatter={formatPrice}
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                          formatter={(value: any) => formatPrice(value)}
                        />
                        <Legend />
                        {selectedCryptos.map((crypto, index) => (
                          <Line
                            key={crypto.id}
                            type="monotone"
                            dataKey={crypto.id}
                            name={`${crypto.name} (${crypto.symbol.toUpperCase()})`}
                            stroke={CHART_COLORS[index % CHART_COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                      No chart data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comparison Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Comparison</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Metric
                          </th>
                          {selectedCryptos.map((crypto) => (
                            <th
                              key={crypto.id}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                            >
                              <div>
                                <div>{crypto.name}</div>
                                <div className="text-xs text-gray-400">{crypto.symbol.toUpperCase()}</div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {/* Rank */}
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                            Rank
                          </td>
                          {selectedCryptos.map((crypto) => (
                            <td key={crypto.id} className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              #{crypto.marketCapRank}
                            </td>
                          ))}
                        </tr>

                        {/* Price */}
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                            Current Price
                          </td>
                          {selectedCryptos.map((crypto) => (
                            <td key={crypto.id} className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                              {formatPrice(crypto.currentPrice)}
                            </td>
                          ))}
                        </tr>

                        {/* 24h Change */}
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                            24h Change
                          </td>
                          {selectedCryptos.map((crypto) => {
                            const isPositive = crypto.priceChangePercentage24h >= 0;
                            return (
                              <td
                                key={crypto.id}
                                className={`px-6 py-4 text-sm font-medium ${
                                  isPositive
                                    ? 'text-success-600 dark:text-success-400'
                                    : 'text-danger-600 dark:text-danger-400'
                                }`}
                              >
                                {isPositive ? '+' : ''}
                                {crypto.priceChangePercentage24h.toFixed(2)}%
                              </td>
                            );
                          })}
                        </tr>

                        {/* Market Cap */}
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                            Market Cap
                          </td>
                          {selectedCryptos.map((crypto) => (
                            <td key={crypto.id} className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {formatNumber(crypto.marketCap)}
                            </td>
                          ))}
                        </tr>

                        {/* Volume */}
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                            24h Volume
                          </td>
                          {selectedCryptos.map((crypto) => (
                            <td key={crypto.id} className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {formatNumber(crypto.volume24h)}
                            </td>
                          ))}
                        </tr>

                        {/* Circulating Supply */}
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                            Circulating Supply
                          </td>
                          {selectedCryptos.map((crypto) => (
                            <td key={crypto.id} className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {crypto.circulatingSupply.toLocaleString()} {crypto.symbol.toUpperCase()}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
