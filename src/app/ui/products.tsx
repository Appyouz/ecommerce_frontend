'use client'

import { useState, useEffect } from "react"
import { fetchProducts } from "../services/product-service"

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

// ProductsPage component: Displays a list of products fetched from the backend
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);


      try {
        const productsData = await fetchProducts();

        // Update state with fetched data
        setProducts(productsData)
        console.log("ProductsPage: Successfully fetched products")
      } catch (err) {
        console.log("ProductsPage: Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) return <p>Loading products...</p>
  if (error) return <div style={{ color: 'red' }}>{error}</div>


  return (
    <div style={{ padding: '20px' }}>
      <h1>Products</h1>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {products.map(product => (
            <div key={product.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', width: '200px', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' }}>
              {product.image && (
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} />
              )}
              <h2 style={{ fontSize: '1.2em', marginBottom: '5px' }}>{product.name}</h2>
              <p style={{ color: '#007bff', fontWeight: 'bold', marginBottom: '5px' }}>${parseFloat(product.price).toFixed(2)}</p>
              {product.category && (
                <p style={{ fontSize: '0.9em', color: '#555', marginBottom: '5px' }}>Category: {product.category.name}</p>
              )}
              <p style={{ fontSize: '0.9em', color: product.stock > 0 ? 'green' : 'red' }}>Stock: {product.stock}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
