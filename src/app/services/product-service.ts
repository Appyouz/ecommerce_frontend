const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  category: {
    id: number;
    name: string;
  } | null;
  image: string | null;
  created_at: string;
  updated_at: string;
};

// Service function to fetch the list of all products from the backend API
export const fetchProducts = async (): Promise<Product[]> => {
  const endpoint = `${API_URL}/api/products/`;

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
