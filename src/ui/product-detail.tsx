'use client'

import { useState, useEffect } from "react"
import { addItemToCart, fetchProductById } from "@/services/product-service";
import Image from "next/image";

import { useParams } from 'next/navigation';
import { useAuth } from "@/context/auth-context";

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
}


export default function ProductDetailPage() {

  const params = useParams();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null)

  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartMessage, setAddToCartMessage] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      // Clear previous error and product data
      setError(null);
      setProduct(null);
      setAddToCartMessage(null);

      console.log(`ProductDetailPage: Attempting to fetch product with ID: ${productId}`);

      try {
        const productData = await fetchProductById(productId as string);

        setProduct(productData);
        console.log(`ProductDetailPage: Fetch for product ${productId} complete.`);
      } catch (err) {

        console.error(`ProductDetailPage: Error fetching product ${productId}:`, err);
        setError(`Failed to load product ${productId}. Please try again later.`);
      } finally {
        setLoading(false)
      }

    }

    if (productId) {
      console.log(`ProductDetailPage useEffect: productId is valid (${productId}), proceeding with fetch.`);
      loadProduct();
    } else {
      console.log("ProductDetailPage useEffect: productId is invalid or not yet available from useParams, skipping fetch.");
      setLoading(false);
      setError("Invalid product ID provided in URL.");
    }
  }, [productId]);


  // Add to cart button handler
  const handleAddToCart = async () => {
    // Ensure data is loaded and user is authenticated
    if (!product || !isAuthenticated) {
      console.warn("Cannot add to cart: Product data not loaded or user not authenticated.");
      setAddToCartMessage("Please log in to add items to your cart.");
      return;
    }

    setAddingToCart(true);
    setAddToCartMessage(null); // Clean previous messages


    try {
      // Call the service function to add the item to the cart
      const quantityToAdd = 1;
      console.log(`Attempting to add product ${product.id} with quantity ${quantityToAdd} to cart.`);
      const cartItem = await addItemToCart(product.id, quantityToAdd)

      console.log("Item added to cart successfully:", cartItem);
      setAddToCartMessage(`${cartItem.product.name} added to cart (${cartItem.quantity} total).`);

    } catch (err) {
      console.error("Error adding item to cart:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to add item to cart.";
      if (errorMessage.includes("Authentication token not available")) {
        setAddToCartMessage("Authentication required. Please log in.");
      } else {
        setAddToCartMessage(errorMessage);
      }
    } finally {
      setAddingToCart(false);
    }
  }

  if (loading) {
    return <p>Loading product details...</p>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    // Main div
    <div className="max-w-6xl mx-auto p-4 bg-white border border-gray-200 rounded-lg shadow-sm">

      {/* Section for images, product-detail, and seller-details */}
      <div className="grid md:grid-cols-12 gap-6">

        {/* Product image */}
        <div className="md:col-span-4">
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
              className="rounded-lg mb-5 h-auto"
            />
          )}
        </div>

        {/* Product name, price, stock, category, add to cart */}
        <div className="md:col-span-5">
          <h1 className="text-xl font-semibold">{product.name}</h1>
          <p className="text-lg text-gray-700">Price: {product.price}</p>
          <p className="text-lg text-gray-700">Category: {product.category.id}</p>
          <p className={`text-base ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            Stock: {product.stock}
          </p>
          <p className="text-sm text-gray-500">{product.description}</p>

          {/* Conditional Add to Cart Section */}
          {isAuthenticated ? (
            product.stock > 0 ? (
              <div>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`mt-4 py-2 px-4 text-base rounded border-0
                bg-green-600 text-white
                ${addingToCart ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-green-700'}`}
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>

                {addToCartMessage && (
                  <p className={`mt-2 ${error ? 'text-red-600' : 'text-green-600'}`}>
                    {addToCartMessage}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-red-600">Out of Stock</p>
            )
          ) : (
            <p className="mt-4 text-gray-600">Log in to add to cart.</p>
          )}
        </div>

        {/* Seller details — placed to the right */}
        <div className="md:col-span-3 bg-gray-100 p-4 rounded shadow-sm flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Seller Info</h2>
          <p className="text-sm text-gray-700">Name: Seller</p>
          <p className="text-sm text-gray-700">Rating: ⭐ 4.5</p>
          <p className="text-sm text-gray-700">Location: Your Basement</p>
          <button className="mt-2 py-2 px-4 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
            View Seller
          </button>
        </div>
      </div>
    </div>
  )
}
