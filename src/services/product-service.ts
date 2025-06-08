import { Product, Category } from "@/types";
import { getAuthHeaders, clearAuthTokens } from "@/services/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Service function to fetch the list of all products from the backend API
export const fetchProducts = async (
  searchTerm: string = "",
  categoryId: string = "",
): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (searchTerm) params.append("search", searchTerm);
  if (categoryId) params.append("category", categoryId);

  const endpoint = `${API_URL}/api/products/?${params.toString()}`;
  console.log(`Attempting to fetch products via API: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail ||
        errorData?.message ||
        `Failed to fetch products (Status: ${response.status})`;
      throw new Error(errorMessage);
    }

    const productsData: Product[] = await response.json();
    return productsData;
  } catch (error) {
    console.error("Error in fetchProducts service:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Network error fetching products",
    );
  }
};

export const fetchProductById = async (
  id: string | number,
): Promise<Product | null> => {
  const endpoint = `${API_URL}/api/products/${id}/`;
  console.log(`Fetching single product from: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.status === 404) {
      console.log(`Product with ID ${id} not found (404 response).`);
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail ||
        errorData?.message ||
        `Failed to fetch product ${id} (Status: ${response.status})`;
      throw new Error(errorMessage);
    }

    const productData: Product = await response.json();

    return productData;
  } catch (error) {
    console.error(`Error in fetchProductById service for ID ${id}:`, error);
    throw new Error(
      error instanceof Error
        ? error.message
        : `Network error fetching product ${id}`,
    );
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  const endpoint = `${API_URL}/api/categories/`;
  console.log(`Attempting to fetch categories via API: ${endpoint}`);
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail ||
        errorData?.message ||
        `Failed to fetch categories (Status: ${response.status})`;
      console.error("API Error response:", errorData);
      throw new Error(errorMessage);
    }

    const categoriesData: Category[] = await response.json();
    return categoriesData;
  } catch (error) {
    console.error("Error in fetchCategories service:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Network error fetching categories",
    );
  }
};

type CartItemResponse = {
  id: number;
  cart: number;
  product: Product;
  quantity: number;
  created_at: string;
  updated_at: string;
};

// Service function to add an item to the authenticated user's cart
export const addItemToCart = async (
  productId: number,
  quantity: number,
): Promise<CartItemResponse> => {
  const endpoint = `${API_URL}/api/cart/items/`;
  console.log(
    `Attempting to add product ${productId} (quantity ${quantity}) to cart via API: ${endpoint}`,
  );

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
      }),
    });

    if (response.status === 401) {
      console.warn(
        "addItemToCart (product-service): Received 401 Unauthorized. Token might be expired or invalid. Clearing tokens.",
      );
      clearAuthTokens();
      throw new Error("Authentication required. Please log in.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail ||
        errorData?.message ||
        `Failed to add item to cart (Status: ${response.status})`;
      console.error("API Error response:", errorData);
      throw new Error(errorMessage);
    }

    const cartItemData: CartItemResponse = await response.json();
    return cartItemData;
  } catch (error) {
    console.error(
      `Error in addItemToCart service for product ${productId}:`,
      error,
    );
    throw new Error(
      error instanceof Error
        ? error.message
        : `Network error adding product ${productId} to cart`,
    );
  }
};
