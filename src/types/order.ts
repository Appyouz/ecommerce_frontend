import { Product } from "./product";

export type OrderItemResponse = {
  id: number;
  order: number;
  product: Product;
  product_name: string;
  product_price: string;
  quantity: number;
  get_total_item_price: number;
  created_at: string;
  updated_at: string;
};

export type OrderResponse = {
  id: number;
  user: number;
  items: OrderItemResponse[];
  total_amount: string;
  status: string;
  created_at: string;
  updated_at: string;
};
