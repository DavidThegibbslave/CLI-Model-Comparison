import React, { useState, useEffect } from 'react';
import { Loading, Card, CardContent } from '@/components/ui';
import {
  PortfolioStats,
  HoldingsTable,
  AllocationChart,
  TransactionHistory,
} from '@/components/portfolio';
import {
  Portfolio as PortfolioType,
  PortfolioPerformance,
  CryptoHolding,
  PortfolioService,
} from '@/services/portfolioService';
import { useToast } from '@/contexts';
import { useNavigate } from 'react-router-dom';

/**
 * Portfolio page component
 */
export const Portfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioType | null>(null);
  const [performance, setPerformance] = useState<PortfolioPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'holdings' | 'transactions'>('holdings');
  const { showError } = useToast();
  const navigate = useNavigate();

  /**
   * Fetch portfolio data
   */
  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true);
      const [portfolioData, performanceData] = await Promise.all([
        PortfolioService.getPortfolio(),
        PortfolioService.getPerformance(),
      ]);
      setPortfolio(portfolioData);
      setPerformance(performanceData);
    } catch (error: any) {
      console.error('Failed to fetch portfolio:', error);
      if (error.code === 'HTTP_404') {
        // Portfolio doesn't exist yet - this is okay
        setPortfolio(null);
        setPerformance(null);
      } else {
        showError('Error', 'Failed to load portfolio data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  /**
   * Handle holding click (navigate to crypto detail)
   */
  const handleHoldingClick = (holding: CryptoHolding) => {
    navigate(`/?crypto=${holding.cryptoId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Portfolio</h1>
        <div className="flex items-center justify-center py-20">
          <Loading text="Loading portfolio..." />
        </div>
      </div>
    );
  }

  // Empty portfolio state
  if (!portfolio || !performance || portfolio.holdings.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Portfolio</h1>
        <Card>
          <CardContent>
            <div className="text-center py-16">
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Your Portfolio is Empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Start building your crypto portfolio by purchasing cryptocurrencies from our store.
                Track your investments, monitor performance, and watch your portfolio grow.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/store')}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  Browse Store
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
                >
                  View Market
                </button>
              </div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Portfolio</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your cryptocurrency investments and performance
          </p>
        </div>
        <button
          onClick={fetchPortfolioData}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Refresh"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Performance Stats */}
      <PortfolioStats performance={performance} />

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('holdings')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'holdings'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Holdings & Allocation
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'transactions'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Transaction History
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'holdings' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Holdings Table - Takes 2 columns */}
          <div className="lg:col-span-2">
            <HoldingsTable holdings={portfolio.holdings} onHoldingClick={handleHoldingClick} />
          </div>

          {/* Allocation Chart - Takes 1 column */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <AllocationChart allocations={performance.allocations} />

              {/* Best & Worst Performers */}
              {(performance.bestPerformer || performance.worstPerformer) && (
                <Card>
                  <CardContent>
                    <div className="space-y-4">
                      {performance.bestPerformer && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Best Performer
                            </span>
                          </div>
                          <div className="pl-7">
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                              {performance.bestPerformer.name}
                            </p>
                            <p className="text-sm text-success-600 dark:text-success-400 font-medium">
                              +{performance.bestPerformer.profitLossPercentage.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      )}

                      {performance.worstPerformer && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Worst Performer
                            </span>
                          </div>
                          <div className="pl-7">
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                              {performance.worstPerformer.name}
                            </p>
                            <p className="text-sm text-danger-600 dark:text-danger-400 font-medium">
                              {performance.worstPerformer.profitLossPercentage.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      ) : (
        <TransactionHistory />
      )}
    </div>
  );
};
