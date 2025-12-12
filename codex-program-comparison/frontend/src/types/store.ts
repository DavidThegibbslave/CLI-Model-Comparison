export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export type Cart = {
  id: string;
  userId?: string;
  items: CartItem[];
  total: number;
  currency?: string;
};
