import { ApiService } from './api';
import { Cart } from '@/types';

/**
 * Cart Service
 *
 * Handles all shopping cart-related API calls
 */

export interface AddToCartRequest {
  cryptoId: string;
  amount: number;
}

export interface UpdateCartItemRequest {
  amount: number;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  itemsPurchased: number;
  totalValue: number;
  purchasedCryptos: string[];
}

export class CartService {
  /**
   * Get current user's shopping cart
   */
  static async getCart(): Promise<Cart> {
    const response = await ApiService.get<Cart>('/cart');
    return response.data;
  }

  /**
   * Add cryptocurrency to cart or update existing item
   */
  static async addToCart(data: AddToCartRequest): Promise<Cart> {
    const response = await ApiService.post<Cart>('/cart/items', data);
    return response.data;
  }

  /**
   * Update cart item amount
   */
  static async updateCartItem(cartItemId: string, data: UpdateCartItemRequest): Promise<Cart> {
    const response = await ApiService.put<Cart>(`/cart/items/${cartItemId}`, data);
    return response.data;
  }

  /**
   * Remove item from cart
   */
  static async removeCartItem(cartItemId: string): Promise<Cart> {
    const response = await ApiService.delete<Cart>(`/cart/items/${cartItemId}`);
    return response.data;
  }

  /**
   * Process checkout
   */
  static async checkout(): Promise<CheckoutResponse> {
    const response = await ApiService.post<CheckoutResponse>('/cart/checkout');
    return response.data;
  }

  /**
   * Clear all items from cart
   */
  static async clearCart(): Promise<void> {
    await ApiService.delete('/cart');
  }
}
