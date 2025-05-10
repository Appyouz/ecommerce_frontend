import { Product } from "./product";
export type CartItem = {
  id: number;
  product: Product;
  quantity: number;
};
export type Cart = {
  id: number;
  items: CartItem[];
  total_price: string;
};
