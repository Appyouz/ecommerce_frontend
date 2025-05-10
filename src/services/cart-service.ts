const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

import { getAuthToken } from "./auth";
import { Product } from "@/types";

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
