'use client'

import { useState, useEffect } from "react"
import { addItemToCart, fetchProductById } from "@/services/product-service";

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
    <div style={{ padding: '20px' }}>
      {product.image && (
        <img src={product.image} alt={product.name} style={{ maxWidth: '300px', height: 'auto', borderRadius: '8px', marginBottom: '20px' }} />
      )}
      <h1>{product.name}</h1>
      <p style={{ fontSize: '1.5em', color: '#007bff', fontWeight: 'bold', marginBottom: '10px' }}>${parseFloat(product.price).toFixed(2)}</p> {/* Format price */}
      {product.description && (
        <p style={{ marginBottom: '10px' }}>{product.description}</p>
      )}
      {product.category && (
        <p style={{ fontSize: '1em', color: '#555', marginBottom: '5px' }}>Category: {product.category.name}</p>
      )}
      <p style={{ fontSize: '1em', color: product.stock > 0 ? 'green' : 'red' }}>Stock: {product.stock}</p>

      {isAuthenticated ? (
        product.stock > 0 ? (
          <div>
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              style={{
                padding: '10px 15px',
                fontSize: '1em',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: addingToCart ? 'not-allowed' : 'pointer',
                opacity: addingToCart ? 0.6 : 1,
                marginTop: '15px'
              }}
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            {addToCartMessage && (
              <p style={{ marginTop: '10px', color: error ? 'red' : 'green' }}>
                {addToCartMessage}
              </p>
            )}
          </div>
        ) : (
          <p style={{ color: 'red', marginTop: '15px' }}>Out of Stock</p>
        )
      ) : (
        <p style={{ color: '#555', marginTop: '15px' }}>Log in to add to cart.</p>
      )}

    </div>
  );
}
