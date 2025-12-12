import React, { createContext, useContext, useState, useEffect } from 'react';
import { storeService, Cart } from '@/services/storeService';
import { useAuth } from './AuthContext';

interface StoreContextType {
  cart: Cart | null;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  checkout: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await storeService.getCart();
      setCart(data);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated]);

  const addToCart = async (productId: string) => {
    setIsLoading(true);
    try {
      await storeService.addToCart(productId);
      await refreshCart();
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setIsLoading(true);
    try {
      await storeService.removeFromCart(itemId);
      await refreshCart();
    } finally {
      setIsLoading(false);
    }
  };

  const checkout = async () => {
    setIsLoading(true);
    try {
      await storeService.checkout();
      await refreshCart();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StoreContext.Provider value={{ cart, isLoading, refreshCart, addToCart, removeFromCart, checkout }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
