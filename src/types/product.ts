export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  category: Category | null;
  seller?: {
    id: number;
    username: string;
    store_name: string;
  };
  image?: string;
  created_at: string;
  updated_at: string;
}
