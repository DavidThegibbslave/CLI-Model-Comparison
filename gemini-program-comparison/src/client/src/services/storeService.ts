import api from '@/lib/axios';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalPrice: number;
}

export const storeService = {
  getProducts: async () => {
    const response = await api.get<Product[]>('/store/products');
    return response.data;
  },
  getCart: async () => {
    const response = await api.get<Cart>('/store/cart');
    return response.data;
  },
  addToCart: async (productId: string, quantity: number = 1) => {
    await api.post('/store/cart/items', { productId, quantity });
  },
  removeFromCart: async (itemId: string) => {
    await api.delete(`/store/cart/items/${itemId}`);
  },
  checkout: async () => {
    await api.post('/store/checkout');
  }
};
