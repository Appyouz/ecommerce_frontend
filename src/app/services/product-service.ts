const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Product = {
  id: Number;
  name: string;
  description: string | null;
  category: {
    id: number;
    name: string;
  } | null;
  price: string;
  stock: number;
  image: string | null;
  created_at: string;
  updated_at: string;
};

// Service function to fetch the list of all products from the backend API
export const fetchProducts = async (): Promise<Product[]> => {
  const endpoint = `{API_URL}/api/products/`;

  try {
    // Make the GET Request
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

    // Parse and return JSON response
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
