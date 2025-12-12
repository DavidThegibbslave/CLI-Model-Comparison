import { apiClient } from './apiClient';
import type { Cart, CartItem, Product } from '../types/store';

const CART_KEY = 'cm_cart_fallback';

export const sampleProducts: Product[] = [
  {
    id: 'ledger-nano-s-plus',
    name: 'Ledger Nano S Plus',
    description: 'Hardware wallet for secure self-custody with USB-C.',
    price: 79,
    category: 'Hardware',
    imageUrl: 'https://images.unsplash.com/photo-1610986603166-6d1dbeed58f7?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'coldcard-mk4',
    name: 'COLDCARD Mk4',
    description: 'Air-gapped Bitcoin wallet with secure element.',
    price: 157,
    category: 'Hardware',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'yubikey-5c-nfc',
    name: 'YubiKey 5C NFC',
    description: 'FIDO2 hardware security key for MFA.',
    price: 55,
    category: 'Security',
    imageUrl: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'crypto-hoodie',
    name: 'Crypto Hoodie',
    description: 'Premium fleece hoodie with minimalist BTC print.',
    price: 68,
    category: 'Merch',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cold-storage-bundle',
    name: 'Cold Storage Bundle',
    description: 'Ledger + Faraday pouch + seed metal backup.',
    price: 229,
    category: 'Bundle',
    imageUrl: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'seed-metal-plate',
    name: 'Steel Seed Plate',
    description: 'Engraved metal backup for 24-word seed.',
    price: 89,
    category: 'Security',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'desk-mat',
    name: 'Circuit Desk Mat',
    description: 'Oversized desk mat with circuit pattern.',
    price: 39,
    category: 'Merch',
    imageUrl: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'premium-support',
    name: 'Premium Support (1y)',
    description: 'Priority onboarding and security checklist.',
    price: 129,
    category: 'Services',
    imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=600&q=80',
  },
];

function readCart(): Cart {
  if (typeof window === 'undefined') {
    return { id: 'local', items: [], total: 0 };
  }
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return { id: 'local', items: [], total: 0 };
    const parsed = JSON.parse(raw) as Cart;
    return { ...parsed, total: computeTotal(parsed.items) };
  } catch {
    return { id: 'local', items: [], total: 0 };
  }
}

function saveCart(cart: Cart) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function computeTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getLocalCartSnapshot(): Cart {
  const local = readCart();
  local.total = computeTotal(local.items);
  saveCart(local);
  return local;
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data } = await apiClient.get('/api/store/products');
    return (data as any[]).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: Number(p.price ?? 0),
      category: p.category ?? 'General',
      imageUrl: p.imageUrl,
    }));
  } catch {
    return sampleProducts;
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const { data } = await apiClient.get(`/api/store/products/${id}`);
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: Number(data.price ?? 0),
      category: data.category ?? 'General',
      imageUrl: data.imageUrl,
    };
  } catch {
    return sampleProducts.find((p) => p.id === id) || null;
  }
}

export async function fetchCart(): Promise<Cart> {
  try {
    const { data } = await apiClient.get('/api/cart');
    return {
      id: data.id ?? 'api',
      userId: data.userId,
      items: (data.items ?? []).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        name: item.productName ?? item.name,
        price: Number(item.unitPrice ?? item.price ?? 0),
        quantity: item.quantity ?? 1,
        imageUrl: item.imageUrl,
      })),
      total: Number(data.total ?? 0),
      currency: data.currency ?? 'USD',
    };
  } catch {
    return getLocalCartSnapshot();
  }
}

export async function addToCart(product: Product, quantity: number): Promise<Cart> {
  const payload = { productId: product.id, quantity };
  try {
    const { data } = await apiClient.post('/api/cart/items', payload);
    return {
      id: data.id ?? 'api',
      userId: data.userId,
      items: (data.items ?? []).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        name: item.productName ?? item.name,
        price: Number(item.unitPrice ?? item.price ?? 0),
        quantity: item.quantity ?? 1,
        imageUrl: item.imageUrl,
      })),
      total: Number(data.total ?? 0),
      currency: data.currency ?? 'USD',
    };
  } catch {
    const cart = readCart();
    const existing = cart.items.find((item) => item.productId === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl,
      });
    }
    cart.total = computeTotal(cart.items);
    saveCart(cart);
    return cart;
  }
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  try {
    const { data } = await apiClient.post('/api/cart/items', { itemId, quantity });
    return {
      id: data.id ?? 'api',
      userId: data.userId,
      items: (data.items ?? []).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        name: item.productName ?? item.name,
        price: Number(item.unitPrice ?? item.price ?? 0),
        quantity: item.quantity ?? 1,
        imageUrl: item.imageUrl,
      })),
      total: Number(data.total ?? 0),
      currency: data.currency ?? 'USD',
    };
  } catch {
    const cart = readCart();
    cart.items = cart.items
      .map((item) => (item.id === itemId ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);
    cart.total = computeTotal(cart.items);
    saveCart(cart);
    return cart;
  }
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  try {
    const { data } = await apiClient.delete(`/api/cart/items/${itemId}`);
    return {
      id: data.id ?? 'api',
      userId: data.userId,
      items: (data.items ?? []).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        name: item.productName ?? item.name,
        price: Number(item.unitPrice ?? item.price ?? 0),
        quantity: item.quantity ?? 1,
        imageUrl: item.imageUrl,
      })),
      total: Number(data.total ?? 0),
      currency: data.currency ?? 'USD',
    };
  } catch {
    const cart = readCart();
    cart.items = cart.items.filter((item) => item.id !== itemId);
    cart.total = computeTotal(cart.items);
    saveCart(cart);
    return cart;
  }
}

export async function checkoutCart(): Promise<{ cart: Cart; message: string }> {
  try {
    const { data } = await apiClient.post('/api/cart/checkout');
    return {
      cart: { id: data.cartId ?? 'api', items: [], total: 0, currency: data.currency ?? 'USD' },
      message: data.message ?? 'Cart cleared (demo only, no payment).',
    };
  } catch {
    const empty: Cart = { id: 'local', items: [], total: 0 };
    saveCart(empty);
    return { cart: empty, message: 'Cart cleared (demo only, no payment).' };
  }
}
