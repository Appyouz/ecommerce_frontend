'use client';

import { useState, useEffect } from "react"
import { fetchProducts, fetchCategories } from "@/services/product-service"
import { useRouter, useSearchParams } from "next/navigation"
import { Product, Category } from "@/types";
import { useAuth } from "@/context/auth-content"


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('');

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initialSearch = searchParams.get('search') || '';
    const initialCategory = searchParams.get('category') || '';

    setLocalSearchTerm(initialSearch);
    setSearchTerm(initialSearch);
    setSelectedCategory(initialCategory);
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearchTerm !== searchTerm) {
        setSearchTerm(localSearchTerm);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearchTerm, searchTerm]);


  useEffect(() => {
    async function loadProductsAndCategories() {
      setLoading(true);
      setError(null);
      setProducts([]);

      console.log("ProductListPage: Attempting to load products and categories.");

      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
        console.log("ProductListPage: Categories fetched successfully.", categoriesData);

        const productsData = await fetchProducts(searchTerm, selectedCategory);
        setProducts(productsData);
        console.log("ProductListPage: Products fetched successfully.", productsData);

      } catch (err) {
        console.error("ProductListPage: Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to load products or categories. Please try again.");
      } finally {
        setLoading(false);
        console.log("ProductListPage: Data loading finished.");
      }
    }

    if (!isAuthLoading) {
      loadProductsAndCategories();
    } else {
      console.log("ProductListPage useEffect: Auth status still loading, skipping data load for now.");
    }

  }, [isAuthenticated, isAuthLoading, searchTerm, selectedCategory]);


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    router.push(`/products?${params.toString()}`);
  };

  function handleDetail(id: number) {
    console.log("Detail button was clicked!")
    router.push(`/products/${id}/`)
  }

  if (isAuthLoading || loading) return <p>Loading products...</p>
  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Products</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Products</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={localSearchTerm}
          onChange={handleSearchChange}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flexGrow: 1 }}
        />

        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleApplyFilters}
          style={{
            padding: '8px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Apply Filters
        </button>
      </div>

      {products.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {products.map(product => (
            <div key={product.id} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <img
                src={product.image || `https://placehold.co/250x180/e0e0e0/000000?text=${product.name}`}
                alt={product.name}
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://placehold.co/250x180/e0e0e0/000000?text=No+Image`;
                }}
              />
              <div style={{ padding: '15px' }}>
                <h2 style={{ fontSize: '1.2em', marginBottom: '5px' }}>{product.name}</h2>
                <p style={{ color: '#555', fontSize: '0.9em', marginBottom: '10px' }}>{product.category?.name || 'Uncategorized'}</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#333' }}>${parseFloat(product.price).toFixed(2)}</p>
              </div>
              <button onClick={() => handleDetail(product.id)}>detail</button>
            </div>

          ))}
        </div>
      ) : (
        <p>No products found.</p>
      )}

    </div>
  );
