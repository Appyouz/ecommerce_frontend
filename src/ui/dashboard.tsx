'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { requestWithAuth } from '@/services/auth';
import ProductForm from '@/ui/product-form';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Function to fetch products from the server
  const fetchSellerData = async () => {
    if (user?.role === 'SELLER') {
      try {
        const response = await requestWithAuth('http://localhost:8000/api/products/');
        const data = await response.json();
        setProducts(data || []);
      } catch (error) {
        console.error('Failed to fetch seller data:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'SELLER') {
      fetchSellerData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // <-- NEW: Function to handle a new product being created
  const handleProductCreated = () => {
    setShowForm(false); // Hide the form
    fetchSellerData(); // Re-fetch the product list to show the new product
  };

  if (isLoading || loading) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  if (!isAuthenticated) {
    return <div className="p-4">Redirecting to login...</div>;
  }

  if (user?.role === 'SELLER') {
    // Seller Dashboard
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          Seller Dashboard - {user.seller_profile?.store_name || 'My Store'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* <-- NEW: Add a button to toggle the form */}
          <div className="md:col-span-1">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {showForm ? 'Cancel' : 'Add New Product'}
            </button>
            {/* <-- NEW: Conditionally render the form */}
            {showForm && <ProductForm onProductCreated={handleProductCreated} />}
          </div>

          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Your Products</h2>
              {products.length > 0 ? (
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="border-b pb-4">
                      <h3 className="font-medium">{product.name}</h3>
                      <p>Price: ${product.price}</p>
                      <p>Stock: {product.stock}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No products yet. Add your first product!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Buyer Dashboard (fallback)
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Buyer Dashboard</h1>
      <p>Welcome, {user?.username}!</p>
    </div>
  );
}
