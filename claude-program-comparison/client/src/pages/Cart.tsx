import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Loading, Button, Input, Modal } from '@/components/ui';
import { Cart as CartType, CartItem } from '@/types';
import { CartService, CheckoutResponse } from '@/services/cartService';
import { useToast } from '@/contexts';
import { useNavigate } from 'react-router-dom';

/**
 * Format price
 */
const formatPrice = (value: number): string => {
  if (value >= 1) return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(8)}`;
};

export const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(null);

  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  /**
   * Fetch cart
   */
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const data = await CartService.getCart();
      setCart(data);
    } catch (error: any) {
      console.error('Failed to fetch cart:', error);
      if (error.code !== 'HTTP_404') {
        showError('Error', 'Failed to load cart');
      }
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /**
   * Update cart item amount
   */
  const handleUpdateAmount = async (item: CartItem, newAmount: string) => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      showError('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }

    try {
      setUpdatingItemId(item.id);
      const updatedCart = await CartService.updateCartItem(item.id, { amount });
      setCart(updatedCart);
      showSuccess('Updated', 'Cart item updated');
    } catch (error: any) {
      console.error('Failed to update cart item:', error);
      showError('Error', error.message || 'Failed to update cart item');
    } finally {
      setUpdatingItemId(null);
    }
  };

  /**
   * Remove cart item
   */
  const handleRemoveItem = async (itemId: string) => {
    try {
      setRemovingItemId(itemId);
      const updatedCart = await CartService.removeCartItem(itemId);
      setCart(updatedCart);
      showSuccess('Removed', 'Item removed from cart');
    } catch (error: any) {
      console.error('Failed to remove cart item:', error);
      showError('Error', error.message || 'Failed to remove item');
    } finally {
      setRemovingItemId(null);
    }
  };

  /**
   * Checkout
   */
  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      showError('Cart Empty', 'Your cart is empty');
      return;
    }

    try {
      setIsCheckingOut(true);
      const result = await CartService.checkout();
      setCheckoutResult(result);
      setShowSuccessModal(true);
      // Refresh cart (should be empty now)
      await fetchCart();
    } catch (error: any) {
      console.error('Checkout failed:', error);
      showError('Checkout Failed', error.message || 'Failed to complete checkout');
    } finally {
      setIsCheckingOut(false);
    }
  };

  /**
   * Close success modal and navigate
   */
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setCheckoutResult(null);
    navigate('/portfolio');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Shopping Cart</h1>
        <div className="flex items-center justify-center py-20">
          <Loading text="Loading cart..." />
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart || cart.items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Shopping Cart</h1>
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Browse our crypto store and add some cryptocurrencies to your cart
              </p>
              <Button variant="primary" onClick={() => navigate('/store')}>
                Browse Store
              </Button>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Shopping Cart</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/store')}>
          Continue Shopping
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const isPositive = item.priceChangePercentage >= 0;

            return (
              <Card key={item.id}>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {/* Crypto Image */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-400">
                          {item.symbol.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                        {item.symbol}
                      </p>
                      <div className="mt-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Price: {formatPrice(item.currentPrice)}
                        </p>
                        <p
                          className={`text-xs font-medium ${
                            isPositive
                              ? 'text-success-600 dark:text-success-400'
                              : 'text-danger-600 dark:text-danger-400'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {formatPrice(item.priceChange)} ({item.priceChangePercentage.toFixed(2)}%)
                          since added
                        </p>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div className="flex-shrink-0 w-32">
                      <Input
                        inputType="number"
                        value={item.amount.toString()}
                        onChange={(e) => handleUpdateAmount(item, e.target.value)}
                        min="0"
                        step="0.00000001"
                        inputSize="sm"
                        disabled={updatingItemId === item.id}
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="flex-shrink-0 text-right w-32">
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removingItemId === item.id}
                        className="p-2 text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Items</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {cart.totalItems}
                  </span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-gray-100">Total</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {formatPrice(cart.totalValue)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Based on current market prices
                  </p>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleCheckout}
                  isLoading={isCheckingOut}
                  disabled={isCheckingOut}
                >
                  Proceed to Checkout
                </Button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  This is a demo checkout. No real payment required.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && checkoutResult && (
        <Modal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          title="Order Successful!"
        >
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 bg-success-100 dark:bg-success-900/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-success-600 dark:text-success-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Thank you for your demo purchase!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {checkoutResult.message}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Items Purchased</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {checkoutResult.itemsPurchased}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Value</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatPrice(checkoutResult.totalValue)}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Purchased Cryptocurrencies:
                </p>
                <div className="space-y-1">
                  {checkoutResult.purchasedCryptos.map((crypto, index) => (
                    <p key={index} className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {crypto}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <Button variant="primary" fullWidth onClick={handleCloseSuccessModal}>
              View My Portfolio
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
