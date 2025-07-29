import { requestWithAuth } from "./auth";
import { Product } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const fetchSellerDashboard = async () => {
  const response = await requestWithAuth(`${API_URL}/seller/dashboard/`);
  return await response.json();
};

export const createSellerProduct = async (productData: {
  name: string;
  description: string;
  price: string;
  stock: number;
  category: number;
}) => {
  const response = await requestWithAuth(`${API_URL}/api/products/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });
  return await response.json();
};
