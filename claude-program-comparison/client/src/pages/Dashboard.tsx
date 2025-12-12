import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Loading } from '@/components/ui';
import { CryptoTable, CryptoDetailModal } from '@/components/crypto';
import { CryptoMarketData } from '@/types';
import { CryptoService } from '@/services/cryptoService';
import { useSignalR } from '@/hooks/useSignalR';
import { useToast } from '@/contexts';

/**
 * Format number as currency
 */
const formatCurrency = (value: number): string => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

export const Dashboard: React.FC = () => {
  // State
  const [cryptos, setCryptos] = useState<CryptoMarketData[]>([]);
  const [topGainers, setTopGainers] = useState<CryptoMarketData[]>([]);
  const [topLosers, setTopLosers] = useState<CryptoMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoMarketData | null>(null);
  const [priceFlashes, setPriceFlashes] = useState<Record<string, 'up' | 'down'>>({});

  const { showError } = useToast();

  /**
   * Calculate total market stats from crypto data
   */
  const marketStats = useMemo(() => {
    if (cryptos.length === 0) return null;

    const totalMarketCap = cryptos.reduce((sum, crypto) => sum + crypto.marketCap, 0);
    const totalVolume = cryptos.reduce((sum, crypto) => sum + crypto.volume24h, 0);
    const btc = cryptos.find((c) => c.symbol.toLowerCase() === 'btc');
    const btcDominance = btc ? (btc.marketCap / totalMarketCap) * 100 : 0;

    return {
      totalMarketCap,
      totalVolume,
      btcDominance,
    };
  }, [cryptos]);

  /**
   * Fetch initial market data
   */
  const fetchMarketData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch markets and top movers in parallel
      const [marketsData, topMovers] = await Promise.all([
        CryptoService.getMarkets({ perPage: 50, sortBy: 'market_cap', sortOrder: 'desc' }),
        CryptoService.getTopMovers(),
      ]);

      const marketList = marketsData?.data ?? [];
      setCryptos(marketList);
      setTopGainers((topMovers?.gainers ?? []).slice(0, 3));
      setTopLosers((topMovers?.losers ?? []).slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch market data:', err);
      setError('Failed to load market data. Please try again.');
      showError('Error', 'Failed to load market data');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  /**
   * Handle price updates from SignalR
   */
  const handlePriceUpdate = useCallback((update: any) => {
    console.log('Received price update:', update);

    setCryptos((prevCryptos) => {
      const updatedCryptos = [...prevCryptos];
      const newFlashes: Record<string, 'up' | 'down'> = {};

      update.prices.forEach((priceUpdate: any) => {
        const index = updatedCryptos.findIndex((c) => c.id === priceUpdate.id);
        if (index !== -1) {
          const oldPrice = updatedCryptos[index].currentPrice;
          const newPrice = priceUpdate.currentPrice;

          // Determine flash direction
          if (newPrice > oldPrice) {
            newFlashes[priceUpdate.id] = 'up';
          } else if (newPrice < oldPrice) {
            newFlashes[priceUpdate.id] = 'down';
          }

          // Update crypto data
          updatedCryptos[index] = {
            ...updatedCryptos[index],
            currentPrice: newPrice,
            priceChange24h: priceUpdate.priceChange24h,
            priceChangePercentage24h: priceUpdate.priceChangePercentage24h,
            marketCap: priceUpdate.marketCap,
            volume24h: priceUpdate.volume24h,
          };
        }
      });

      // Set flashes
      setPriceFlashes(newFlashes);

      // Clear flashes after animation duration
      setTimeout(() => {
        setPriceFlashes({});
      }, 600);

      return updatedCryptos;
    });
  }, []);

  /**
   * Connect to SignalR hub for real-time updates
   */
  const signalREnabled = (import.meta.env.VITE_ENABLE_SIGNALR ?? 'false') === 'true';

  const { connectionState, isConnected } = useSignalR({
    autoConnect: signalREnabled,
    onPriceUpdate: handlePriceUpdate,
    onError: (error) => {
      console.error('SignalR error:', error);
    },
  });

  /**
   * Initial data fetch
   */
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  /**
   * Handle crypto row click
   */
  const handleCryptoClick = (crypto: CryptoMarketData) => {
    setSelectedCrypto(crypto);
  };

  /**
   * Retry loading data
   */
  const handleRetry = () => {
    fetchMarketData();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Market Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track real-time cryptocurrency prices and market trends
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loading text="Loading market data..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error && cryptos.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Market Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track real-time cryptocurrency prices and market trends
          </p>
        </div>
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-danger-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {error}
              </p>
              <button
                onClick={handleRetry}
                className="mt-4 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Market Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track real-time cryptocurrency prices and market trends
          </p>
        </div>
        {/* Connection Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-success-500 animate-pulse'
                : connectionState === 'Connecting' || connectionState === 'Reconnecting'
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-gray-400'
            }`}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isConnected
              ? 'Live'
              : connectionState === 'Connecting'
              ? 'Connecting...'
              : connectionState === 'Reconnecting'
              ? 'Reconnecting...'
              : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Market Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {marketStats ? formatCurrency(marketStats.totalMarketCap) : '-'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>24h Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {marketStats ? formatCurrency(marketStats.totalVolume) : '-'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>BTC Dominance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {marketStats ? `${marketStats.btcDominance.toFixed(1)}%` : '-'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Bitcoin market share</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Crypto Table - Takes 3 columns */}
        <div className="lg:col-span-3">
          <CryptoTable
            data={cryptos}
            isLoading={isLoading}
            onRowClick={handleCryptoClick}
            priceFlashes={priceFlashes}
          />
        </div>

        {/* Top Movers Sidebar - Takes 1 column */}
        <div className="space-y-6">
          {/* Top Gainers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-success-600 dark:text-success-400">↑</span>
                Top Gainers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topGainers.map((crypto) => (
                  <div
                    key={crypto.id}
                    onClick={() => handleCryptoClick(crypto)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {crypto.image && (
                        <img
                          src={crypto.image}
                          alt={crypto.name}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {crypto.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                          {crypto.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-medium text-success-600 dark:text-success-400">
                        +{crypto.priceChangePercentage24h.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Losers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-danger-600 dark:text-danger-400">↓</span>
                Top Losers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topLosers.map((crypto) => (
                  <div
                    key={crypto.id}
                    onClick={() => handleCryptoClick(crypto)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {crypto.image && (
                        <img
                          src={crypto.image}
                          alt={crypto.name}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {crypto.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                          {crypto.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-medium text-danger-600 dark:text-danger-400">
                        {crypto.priceChangePercentage24h.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Crypto Detail Modal */}
      {selectedCrypto && (
        <CryptoDetailModal
          crypto={selectedCrypto}
          isOpen={!!selectedCrypto}
          onClose={() => setSelectedCrypto(null)}
        />
      )}
    </div>
  );
};
