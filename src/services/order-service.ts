import { requestWithAuth } from "@/services/auth";
import { OrderResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const createOrder = async (): Promise<OrderResponse> => {
  const endpoint = `${API_URL}/api/orders/`;
  console.log(`Attempting to create order via API: ${endpoint}`);

  try {
    // Use requestWithAuth
    const response = await requestWithAuth(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({}),
    });

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

export const fetchOrders = async (): Promise<OrderResponse[]> => {
  const endpoint = `${API_URL}/api/orders/`;
  console.log(`Attempting to fetch orders via API: ${endpoint}`);

  try {
    // Use requestWithAuth
    const response = await requestWithAuth(endpoint, {
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
        `Failed to fetch orders (Status: ${response.status})`;
      console.error("fetchOrders API Error response:", errorData);
      throw new Error(errorMessage);
    }

    const ordersData: OrderResponse[] = await response.json();
    console.log("Orders fetched successfully:", ordersData);
    return ordersData;
  } catch (error) {
    console.error("Error in fetchOrders service:", error);
    throw new Error(
      error instanceof Error ? error.message : "Network error fetching orders",
    );
  }
};
