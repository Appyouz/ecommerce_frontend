'use client'
import { Product, Cart, CartItem } from "@/types"

import { useState, useEffect } from "react";
import { fetchCart } from "@/services/cart-service"; // --- START: Import fetchCart ---
import { useAuth } from "@/context/auth-content"; // --- START: Import useAuth ---


export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    async function loadCart() {
      setLoading(true);
      setError(null);
      setCart(null);

      console.log("CartPage: Attempting to load cart.");

      try {
        const cartData = await fetchCart();

        if (cartData) {
          setCart(cartData);
          console.log("CartPage: Cart data fetched successfully.", cartData);
        } else {
          console.log("CartPage: fetchCart returned null (user likely not authenticated or token invalid).");
          setCart(null);
        }

      } catch (err) {
        console.error("CartPage: Error fetching cart:", err);
        setError(err instanceof Error ? err.message : "Failed to load cart. Please try again.");
      } finally {
        setLoading(false);
        console.log("CartPage: Cart loading finished.");
      }
    }

    if (!isAuthLoading) {
      if (isAuthenticated) {
        console.log("CartPage useEffect: Auth check complete, user is authenticated. Loading cart...");
        loadCart();
      } else {
        console.log("CartPage useEffect: Auth check complete, user is NOT authenticated. Skipping cart load.");
        setLoading(false);
        setCart(null);
      }
    } else {
      console.log("CartPage useEffect: Auth status still loading, skipping cart load for now.");
    }

  }, [isAuthenticated, isAuthLoading]);


  if (isAuthLoading || loading) {
    return <p>Loading cart...</p>;
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Your Shopping Cart</h1>
        <p>Please log in to view your cart.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Your Shopping Cart</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Your Shopping Cart</h1>

      {cart && cart.items && cart.items.length > 0 ? (
        <div>
          {cart.items.map(item => (
            <div key={item.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '8px' }}>
              <h2>{item.product.name}</h2>
              <p>Price: ${parseFloat(item.product.price).toFixed(2)}</p>
              <p>Quantity: {item.quantity}</p>
            </div>
          ))}

          <div style={{ marginTop: '20px', fontSize: '1.2em', fontWeight: 'bold' }}>
            Total: ${parseFloat(cart.total_price).toFixed(2)}
          </div>


        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}

    </div>
  );
}
