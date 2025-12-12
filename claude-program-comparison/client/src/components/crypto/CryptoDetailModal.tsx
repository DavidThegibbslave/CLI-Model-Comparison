import React, { useState, useEffect } from 'react';
import { Modal, Loading } from '@/components/ui';
import { CryptoMarketData, CryptoDetail, CryptoHistory } from '@/types';
import { CryptoService } from '@/services/cryptoService';
import { PriceChart } from './PriceChart';
import { useToast } from '@/contexts';

interface CryptoDetailModalProps {
  crypto: CryptoMarketData;
  isOpen: boolean;
  onClose: () => void;
}

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

export const CryptoDetailModal: React.FC<CryptoDetailModalProps> = ({
  crypto,
  isOpen,
  onClose,
}) => {
  const [detail, setDetail] = useState<CryptoDetail | null>(null);
  const [history, setHistory] = useState<CryptoHistory | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(7);
  const { showError } = useToast();

  /**
   * Fetch crypto detail and history
   */
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        setIsLoadingDetail(true);
        const detailData = await CryptoService.getCryptoDetail(crypto.id);
        setDetail(detailData);
      } catch (error) {
        console.error('Failed to fetch crypto detail:', error);
        showError('Error', 'Failed to load cryptocurrency details');
      } finally {
        setIsLoadingDetail(false);
      }
    };

    fetchData();
  }, [crypto.id, isOpen]);

  /**
   * Fetch price history based on selected time range
   */
  useEffect(() => {
    if (!isOpen) return;

    const fetchHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const historyData = await CryptoService.getCryptoHistory(crypto.id, selectedTimeRange);
        setHistory(historyData);
      } catch (error) {
        console.error('Failed to fetch crypto history:', error);
        showError('Error', 'Failed to load price history');
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [crypto.id, selectedTimeRange, isOpen]);

  const isPositive = crypto.priceChangePercentage24h >= 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        (<div className="flex items-center gap-3">
          {crypto.image && (
            <img src={crypto.image} alt={crypto.name} className="w-10 h-10 rounded-full" />
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {crypto.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
              {crypto.symbol}
            </p>
          </div>
        </div>) as React.ReactNode
      }
      size="xl"
    >
      <div className="space-y-6">
        {/* Price Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Price</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(crypto.currentPrice)}
            </p>
            <p
              className={`text-sm font-medium mt-1 ${
                isPositive
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-danger-600 dark:text-danger-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {crypto.priceChangePercentage24h.toFixed(2)}% (24h)
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Market Cap</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(crypto.marketCap)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Rank #{crypto.marketCapRank}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">24h Volume</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(crypto.volume24h)}
            </p>
          </div>
        </div>

        {/* Price Chart */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-64">
              <Loading text="Loading chart..." />
            </div>
          ) : history ? (
            <PriceChart
              data={history.prices}
              symbol={crypto.symbol}
              isLoading={isLoadingHistory}
              showTimeRangeSelector
              onTimeRangeChange={setSelectedTimeRange}
              selectedTimeRange={selectedTimeRange}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No chart data available
            </div>
          )}
        </div>

        {/* Additional Details */}
        {isLoadingDetail ? (
          <div className="flex items-center justify-center py-8">
            <Loading text="Loading details..." />
          </div>
        ) : detail ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">24h High</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatPrice(detail.high24h)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">24h Low</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatPrice(detail.low24h)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Circulating Supply</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {detail.circulatingSupply.toLocaleString()} {detail.symbol.toUpperCase()}
              </p>
            </div>
            {detail.totalSupply && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Supply</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {detail.totalSupply.toLocaleString()} {detail.symbol.toUpperCase()}
                </p>
              </div>
            )}
            {detail.maxSupply && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Max Supply</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {detail.maxSupply.toLocaleString()} {detail.symbol.toUpperCase()}
                </p>
              </div>
            )}
            {detail.allTimeHigh && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">All-Time High</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatPrice(detail.allTimeHigh)}
                </p>
                {detail.allTimeHighDate && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(detail.allTimeHighDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  );
};
