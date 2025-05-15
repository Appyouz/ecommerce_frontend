import { getAuthToken } from "@/services/auth";
import { Product } from "@/types";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type OrderItemResponse = {
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

type OrderResponse = {
  id: number;
  user: number;
  items: OrderItemResponse[];
  total_amount: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export const createOrder = async (): Promise<OrderResponse> => {
  const endpoint = `${API_URL}/api/orders/`;
  console.log(`Attempting to create order via API: ${endpoint}`);

  const token = await getAuthToken();

  if (!token) {
    console.warn(
      "createOrder: Authentication token not available. User is likely not logged in.",
    );
    throw new Error("Authentication token not available. Please log in.");
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    if (response.status === 401) {
      console.warn(
        "createOrder: Received 401 Unauthorized. Token might be expired or invalid.",
      );
      throw new Error("Authentication required. Please log in.");
    }

    if (response.status === 400) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail ||
        errorData?.message ||
        `Failed to create order (Status: ${response.status})`;
      console.error("createOrder API Error response (400):", errorData);
      throw new Error(errorMessage);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail ||
        errorData?.message ||
        `Failed to create order (Status: ${response.status})`;
      console.error("createOrder API Error response:", errorData);
      throw new Error(errorMessage);
    }

    const orderData: OrderResponse = await response.json();
    console.log("Order created successfully:", orderData);
    return orderData;
  } catch (error) {
    console.error("Error in createOrder service:", error);
    throw new Error(
      error instanceof Error ? error.message : "Network error creating order",
    );
  }
};
