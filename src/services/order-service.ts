import { getAuthToken } from "@/services/auth";
import { OrderResponse } from "@/types";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

export const fetchOrders = async (): Promise<OrderResponse[]> => {
  const endpoint = `${API_URL}/api/orders/`;
  console.log(`Attempting to fetch orders via API: ${endpoint}`);

  const token = await getAuthToken();

  if (!token) {
    console.warn(
      "fetchOrders: Authentication token not available. User is likely not logged in.",
    );
    throw new Error("Authentication token not available. Please log in.");
  }

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      // No body needed for a GET request
    });

    if (response.status === 401) {
      console.warn(
        "fetchOrders: Received 401 Unauthorized. Token might be expired or invalid.",
      );
      throw new Error("Authentication required. Please log in.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail ||
        errorData?.message ||
        `Failed to fetch orders (Status: ${response.status})`;
      console.error("fetchOrders API Error response:", errorData);
      throw new Error(errorMessage);
    }

    // The backend GET /api/orders/ endpoint returns a LIST of orders
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
