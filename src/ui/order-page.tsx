'use client';

import { useState, useEffect } from 'react';
import { fetchOrders } from '@/services/order-service';
import { useAuth } from '@/context/auth-content';
import { OrderResponse } from '@/types';


export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth(); // Get auth state

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      setError(null);
      setOrders([]);

      console.log("OrderHistoryPage: Attempting to load orders.");

      if (!isAuthenticated) {
        setLoading(false);
        console.log("OrderHistoryPage useEffect: User not authenticated. Skipping order load.");
        return;
      }

      try {
        const ordersData = await fetchOrders(); // Call your service function here



        setOrders(ordersData);
        console.log("OrderHistoryPage: Orders data fetched successfully.", ordersData);

      } catch (err) {
        console.error("OrderHistoryPage: Error fetching orders:", err);
        if (err instanceof Error && err.message.includes("Authentication required")) {
          setError("You must be logged in to view your order history.");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load orders. Please try again.");
        }
      } finally {
        setLoading(false);
        console.log("OrderHistoryPage: Order loading finished.");
      }
    }

    if (!isAuthLoading) {
      if (isAuthenticated) {
        console.log("OrderHistoryPage useEffect: Auth check complete, user is authenticated. Loading orders...");
        loadOrders();
      } else {
        console.log("OrderHistoryPage useEffect: Auth check complete, user is NOT authenticated. Skipping order load.");
        setLoading(false);
      }
    } else {
      console.log("OrderHistoryPage useEffect: Auth status still loading, skipping order load for now.");
    }


  }, [isAuthenticated, isAuthLoading]);


  if (isAuthLoading || loading) {
    return <p>Loading order history...</p>;
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Order History</h1>
        <p>Please log in to view your order history.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Order History</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Order History</h1>

      {orders.length > 0 ? (
        <div>
          {/* Map over the orders to display them */}
          {orders.map(order => (
            <div key={order.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
              <h2>Order #{order.id}</h2>
              <p>Date: {new Date(order.created_at).toLocaleDateString()}</p> {/* Format date */}
              <p>Status: {order.status}</p>
              <p>Total: ${parseFloat(order.total_amount).toFixed(2)}</p>

              {/* Display items within the order */}
              <div style={{ marginTop: '10px', paddingLeft: '20px', borderTop: '1px dashed #eee' }}>
                <h3>Items:</h3>
                {order.items && order.items.length > 0 ? (
                  <ul>
                    {order.items.map(item => ( // item is now typed as OrderItemResponse
                      <li key={item.id}>
                        {item.quantity} x {item.product_name} - ${parseFloat(item.product_price).toFixed(2)} each
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No items found for this order.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>You have no past orders.</p>
      )}

    </div>
  );
}
