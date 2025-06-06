import { Product } from "./product";

export type CartItem = {
  id: number;
  cart: number;
  product: Product;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type Cart = {
  id: number;
  cart: number;
  product: Product;
  quantity: number;
  created_at: string;
  updated_at: string;
};
