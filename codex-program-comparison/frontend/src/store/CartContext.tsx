import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { addToCart, checkoutCart, fetchCart, getLocalCartSnapshot, removeCartItem, updateCartItem } from '../services/storeService';
import { useAuth } from './AuthContext';
import type { Cart, Product } from '../types/store';

type CartContextValue = {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addItem: (product: Product, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  checkout: () => Promise<string>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: PropsWithChildren) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, status } = useAuth();

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCart();
      setCart(data);
    } catch (err: any) {
      setError(err?.message || 'Unable to load cart');
    } finally {
      setLoading(false);
    }
  }

  async function addItem(product: Product, quantity: number) {
    setLoading(true);
    setError(null);
    try {
      const updated = await addToCart(product, quantity);
      setCart(updated);
    } catch (err: any) {
      setError(err?.message || 'Unable to add item');
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateCartItem(itemId, quantity);
      setCart(updated);
    } catch (err: any) {
      setError(err?.message || 'Unable to update quantity');
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(itemId: string) {
    setLoading(true);
    setError(null);
    try {
      const updated = await removeCartItem(itemId);
      setCart(updated);
    } catch (err: any) {
      setError(err?.message || 'Unable to remove item');
    } finally {
      setLoading(false);
    }
  }

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const { cart: cleared, message } = await checkoutCart();
      setCart(cleared);
      return message;
    } catch (err: any) {
      setError(err?.message || 'Checkout failed');
      return 'Checkout failed';
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === 'loading') return;
    if (isAuthenticated) {
      void refresh();
    } else {
      setCart(getLocalCartSnapshot());
      setError(null);
      setLoading(false);
    }
  }, [isAuthenticated, status]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      loading,
      error,
      addItem,
      updateQuantity,
      removeItem,
      checkout,
      refresh,
    }),
    [cart, loading, error],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
