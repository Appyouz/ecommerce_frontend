const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

import { getAuthToken } from "./auth";
import { Product } from "@/types";

type CartItem = {
  id: number;
  cart: number;
  product: Product;
  quantity: number;
  created_at: string;
  updated_at: string;
};

type Cart = {
  id: number;
  cart: number;
  product: Product;
  quantity: number;
  created_at: string;
  updated_at: string;
};

// Service function to fetch the authenticated user's cart
export const fetchCart = async (): Promise<Cart | null> => {
  const endpoint = `${API_URL}/api/cart/`;
  console.log(`Attempting to fetch user's cart via API: ${endpoint}`);

  const token = await getAuthToken();

  if (!token) {
    console.warn(
      "fetchCart: Authentication token not available. User is likely not logged in.",
    );
    return null; // This allows component to display a message please log in
  }

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status == 401) {
      console.warn(
        "fetchCart: Received 401 Unauthorized. Token might be expired or invalid.",
      );

      return null;
    }
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
    // Re-throw a new Error with a user-friendly message
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
    `Attempting to update cart item ${cartItemId} with quantity ${newQuantity} via API: ${endpoint}`,
  );

  const token = await getAuthToken();

  if (!token) {
    console.warn(
      "updateCartItemQuantity: Authentication token not available. User is likely not logged in.",
    );
    throw new Error("Authentication token not available. Please log in.");
  }

  try {
    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      // Send the new quantity in the request body
      body: JSON.stringify({
        quantity: newQuantity,
      }),
    });

    if (response.status === 401) {
      console.warn(
        "updateCartItemQuantity: Received 401 Unauthorized. Token might be expired or invalid.",
      );
      throw new Error("Authentication required. Please log in.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail ||
        errorData?.message ||
        `Failed to fetch cart (Status: ${response.status})`;
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
    // Re-throw a new Error with a user-friendly message
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

  const token = await await getAuthToken();

  if (!token) {
    console.warn(
      "removeCartItem: Authentication token not available. User is likely not logged in.",
    );
    throw new Error("Authentication token not available. Please log in.");
  }

  try {
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      console.warn(
        "removeCartItem: Received 401 Unauthorized. Token might be expired or invalid.",
      );
      throw new Error("Authentication required. Please log in.");
    }

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
