'use client'

import { useState, useEffect } from "react"
import { fetchProductById } from "../services/product-service"

import { useParams } from 'next/navigation';

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

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      // Clear previous error and product data
      setError(null);
      setProduct(null);

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

    </div>
  );
}
