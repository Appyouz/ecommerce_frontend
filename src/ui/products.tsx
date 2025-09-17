'use client';

import { useState, useEffect } from "react";
import { fetchProducts, fetchCategories } from "@/services/product-service";
import { useRouter, useSearchParams } from "next/navigation";
import { Product, Category } from "@/types";
import { useAuth } from "@/context/auth-context";
import Link from 'next/link'; // Import Link for better navigation

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
  }, [isAuthLoading, searchTerm, selectedCategory]);

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

  if (isAuthLoading || loading) return <p className="p-5 text-center">Loading products...</p>;
  if (error) {
    return (
      <div className="p-5 text-red-500">
        <h1 className="text-3xl font-bold mb-4">Products</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Products</h1>
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Search products..."
          value={localSearchTerm}
          onChange={handleSearchChange}
          className="w-full md:w-auto flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-full md:w-auto p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
          className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 ease-in-out"
        >
          Apply Filters
        </button>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <Link key={product.id} href={`/products/${product.id}`} passHref className="group block h-full">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out h-full flex flex-col">
                <img
                  src={product.image || `https://placehold.co/400x300/e0e0e0/000000?text=${product.name}`}
                  alt={product.name}
                  className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://placehold.co/400x300/e0e0e0/000000?text=No+Image`;
                  }}
                />
                <div className="p-5 flex-grow">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h2>
                  <p className="text-sm text-gray-500 mb-2">{product.category?.name || 'Uncategorized'}</p>
                  <p className="text-xl font-extrabold text-blue-600">${parseFloat(product.price).toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg">No products found.</p>
      )}
    </div>
  );
}
