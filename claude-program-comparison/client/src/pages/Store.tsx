import React, { useState, useEffect, useMemo } from 'react';
import { Card, Loading, Button, Input, Modal } from '@/components/ui';
import { CryptoMarketData } from '@/types';
import { CryptoService } from '@/services/cryptoService';
import { CartService } from '@/services/cartService';
import { useToast, useAuth } from '@/contexts';
import { useNavigate } from 'react-router-dom';

/**
 * Format price
 */
const formatPrice = (value: number): string => {
  if (value >= 1) return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(8)}`;
};

export const Store: React.FC = () => {
  const [cryptos, setCryptos] = useState<CryptoMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoMarketData | null>(null);
  const [amount, setAmount] = useState('0.01');
  const [isAdding, setIsAdding] = useState(false);
  const [addingCryptoId, setAddingCryptoId] = useState<string | null>(null);

  const { showSuccess, showError } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  /**
   * Fetch crypto list
   */
  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        setIsLoading(true);
        const data = await CryptoService.getMarkets({ perPage: 50, sortBy: 'market_cap', sortOrder: 'desc' });
        setCryptos(data.data);
      } catch (error) {
        console.error('Failed to fetch cryptos:', error);
        showError('Error', 'Failed to load cryptocurrencies');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCryptos();
  }, [showError]);

  /**
   * Filter cryptos by search term
   */
  const filteredCryptos = useMemo(() => {
    if (!searchTerm) return cryptos;

    const term = searchTerm.toLowerCase();
    return cryptos.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(term) ||
        crypto.symbol.toLowerCase().includes(term)
    );
  }, [cryptos, searchTerm]);

  /**
   * Add to cart (quick add)
   */
  const handleQuickAddToCart = async (crypto: CryptoMarketData) => {
    if (!isAuthenticated) {
      showError('Authentication Required', 'Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      setAddingCryptoId(crypto.id);
      await CartService.addToCart({
        cryptoId: crypto.id,
        amount: 0.01, // Default amount for quick add
      });
      showSuccess('Added to Cart', `${crypto.name} added to your cart!`);
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      showError('Error', error.message || 'Failed to add to cart');
    } finally {
      setAddingCryptoId(null);
    }
  };

  /**
   * Open detail modal
   */
  const handleViewDetails = (crypto: CryptoMarketData) => {
    setSelectedCrypto(crypto);
    setAmount('0.01');
  };

  /**
   * Add to cart (from modal with custom amount)
   */
  const handleAddToCartWithAmount = async () => {
    if (!selectedCrypto) return;

    if (!isAuthenticated) {
      showError('Authentication Required', 'Please login to add items to cart');
      navigate('/login');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showError('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }

    try {
      setIsAdding(true);
      await CartService.addToCart({
        cryptoId: selectedCrypto.id,
        amount: amountNum,
      });
      showSuccess('Added to Cart', `${amountNum} ${selectedCrypto.symbol.toUpperCase()} added to your cart!`);
      setSelectedCrypto(null);
      setAmount('0.01');
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      showError('Error', error.message || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Crypto Store</h1>
        <div className="flex items-center justify-center py-20">
          <Loading text="Loading products..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Crypto Store</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Browse and add cryptocurrencies to your cart
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/cart')}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        >
          View Cart
        </Button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          inputType="search"
          placeholder="Search cryptocurrencies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCryptos.map((crypto) => {
          const isPositive = crypto.priceChangePercentage24h >= 0;

          return (
            <Card key={crypto.id} hover padding="none">
              <div className="p-6 space-y-4">
                {/* Image */}
                <div className="flex items-center justify-center">
                  {crypto.image ? (
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-400">
                        {crypto.symbol.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name & Symbol */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {crypto.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                    {crypto.symbol}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatPrice(crypto.currentPrice)}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      isPositive
                        ? 'text-success-600 dark:text-success-400'
                        : 'text-danger-600 dark:text-danger-400'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {crypto.priceChangePercentage24h.toFixed(2)}% (24h)
                  </p>
                </div>

                {/* Rank Badge */}
                <div className="flex items-center justify-center">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                    Rank #{crypto.marketCapRank}
                  </span>
                </div>

                {/* Buttons */}
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => handleQuickAddToCart(crypto)}
                    isLoading={addingCryptoId === crypto.id}
                    disabled={addingCryptoId === crypto.id}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    }
                  >
                    Quick Add (0.01)
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => handleViewDetails(crypto)}
                  >
                    Custom Amount
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCryptos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No cryptocurrencies found matching "{searchTerm}"
          </p>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedCrypto && (
        <Modal
          isOpen={!!selectedCrypto}
          onClose={() => setSelectedCrypto(null)}
          title={
            (<div className="flex items-center gap-3">
              {selectedCrypto.image && (
                <img
                  src={selectedCrypto.image}
                  alt={selectedCrypto.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedCrypto.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                  {selectedCrypto.symbol}
                </p>
              </div>
            </div>) as React.ReactNode
          }
        >
          <div className="space-y-6">
            {/* Price Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Price</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatPrice(selectedCrypto.currentPrice)}
              </p>
              <p
                className={`text-sm font-medium mt-1 ${
                  selectedCrypto.priceChangePercentage24h >= 0
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-danger-600 dark:text-danger-400'
                }`}
              >
                {selectedCrypto.priceChangePercentage24h >= 0 ? '+' : ''}
                {selectedCrypto.priceChangePercentage24h.toFixed(2)}% (24h)
              </p>
            </div>

            {/* Amount Input */}
            <div>
              <Input
                label="Amount"
                inputType="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                helperText={`Total: ${formatPrice(parseFloat(amount || '0') * selectedCrypto.currentPrice)}`}
                min="0"
                step="0.00000001"
              />
            </div>

            {/* Add to Cart Button */}
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleAddToCartWithAmount}
              isLoading={isAdding}
              disabled={isAdding}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
            >
              Add to Cart
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
