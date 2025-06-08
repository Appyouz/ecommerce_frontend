import { requestWithAuth } from "./auth";
import { Product, CartItem, Cart } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Service function to fetch the authenticated user's cart
export const fetchCart = async (): Promise<Cart | null> => {
  const endpoint = `${API_URL}/api/cart/`;
  console.log(`Attempting to fetch user's cart via API: ${endpoint}`);

  try {
    // Use requestWithAuth for authenticated requests
    const response = await requestWithAuth(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    // requestWithAuth handles 401s and token refreshing.
    // If we reach here and response is not ok, it's a different API error.
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail ||
        errorData?.message ||
        `Failed to fetch cart (Status: ${response.status})`;
      console.error("API Error response:", errorData);
      throw new Error(errorMessage);
    }

    const cartData: Cart = await response.json();
    return cartData;
  } catch (error) {
    console.error("Error in fetchCart service:", error);
    // The error thrown by requestWithAuth already indicates authentication failure
    // or a network error. Re-throw it.
    throw new Error(
      error instanceof Error ? error.message : "Network error fetching cart",
    );
  }
};

export const updateCartItemQuantity = async (
  cartItemId: number,
  newQuantity: number,
): Promise<CartItem> => {
  const endpoint = `${API_URL}/api/cart/items/${cartItemId}/`;
  console.log(
    `Attempting to update cart item ${cartItemId} with quantity ${newQuantity} ` +
      `via API: ${endpoint}`,
  );

  try {
    // Use requestWithAuth
    const response = await requestWithAuth(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        quantity: newQuantity,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail ||
        errorData?.message ||
        `Failed to update cart (Status: ${response.status})`;
      console.error("API Error response:", errorData);
      throw new Error(errorMessage);
    }

    const updatedCartItem: CartItem = await response.json();
    return updatedCartItem;
  } catch (error) {
    console.error(
      `Error in updateCartItemQuantity service for item ${cartItemId}:`,
      error,
    );
    throw new Error(
      error instanceof Error
        ? error.message
        : `Network error updating cart item ${cartItemId}`,
    );
  }
};

export const removeCartItem = async (cartItemId: number): Promise<void> => {
  const endpoint = `${API_URL}/api/cart/items/${cartItemId}/`;
  console.log(
    `Attempting to remove cart item ${cartItemId} via API: ${endpoint}`,
  );

  try {
    // Use requestWithAuth
    const response = await requestWithAuth(endpoint, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail ||
        errorData?.message ||
        `Failed to remove cart item ${cartItemId} (Status: ${response.status})`;
      console.error("API Error response:", errorData);
      throw new Error(errorMessage);
    }

    console.log(`Cart item ${cartItemId} removed successfully.`);
  } catch (error) {
    console.error(
      `Error in removeCartItem service for item ${cartItemId}:`,
      error,
    );
    throw new Error(
      error instanceof Error
        ? error.message
        : `Network error removing cart item ${cartItemId}`,
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

export const addItemToCart = async (
  productId: number,
  quantity: number,
): Promise<CartItemResponse> => {
  const endpoint = `${API_URL}/api/cart/items/`;
  console.log(
    `Attempting to add product ${productId} (quantity ${quantity}) to cart ` +
      `via API: ${endpoint}`,
  );

  try {
    // Use requestWithAuth
    const response = await requestWithAuth(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
      }),
    });

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
