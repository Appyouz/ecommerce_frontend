'use client'
import { Product, Cart, CartItem } from "@/types"

import { useState, useEffect } from "react";
import { fetchCart, updateCartItemQuantity, removeCartItem } from "@/services/cart-service";
import { useAuth } from "@/context/auth-content";
import { useParams } from "next/navigation";



export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);
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



  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {

    // Ensure quantity is atleast 1
    if (newQuantity < 1) {
      console.warn("handleUpdateQuantity: Quantity must be at least 1.");
      return;
    }


    // Prevent multiple updates on the same item simultaneously
    if (updatingItemId === item.id) {
      console.log(`handleUpdateQuantity: Already updating item ${item.id}. Ignoring.`);
      return;
    }

    setUpdatingItemId(item.id);

    try {
      const updatedItem = await updateCartItemQuantity(item.id, newQuantity);
      console.log("handleUpdateQuantity: Item updated successfully:", updatedItem);

      setCart(prevCart => {
        if (!prevCart) return null;

        const itemIndex = prevCart.items.findIndex(cartItem => cartItem.id === updatedItem.id);

        if (itemIndex === -1) return prevCart; // Should not happen

        const newItems = [...prevCart.items]
        newItems[itemIndex] = updatedItem

        const newTotalPrice = newItems.reduce((sum, currentItem) => {
          const itemPrice = parseFloat(currentItem.product?.price || '0')
          return sum + (itemPrice * currentItem.quantity);
        }, 0)

        return {
          ...prevCart,
          items: newItems,
          total_price: newTotalPrice.toFixed(2)
        }
      })

    } catch (err) {
      console.error(`handleUpdateQuantity: Error updating item ${item.id}:`, err);
    } finally {

      setUpdatingItemId(null); // Clear the item ID being updated
    }
  }

  const handleRemoveItem = async (item: CartItem) => {

    if (removingItemId === item.id) {
      console.log(`handleRemoveItem: Already removing item ${item.id}. Ignoring.`);
      return
    }

    setRemovingItemId(item.id)

    try {
      await removeCartItem(item.id)
      console.log("handleRemoveItem: Item removed successfully:", item.id);

      setCart(prevCart => {
        if (!prevCart) return null;

        const newItems = prevCart.items.filter(cartItem => cartItem.id !== item.id)
        const newTotalPrice = newItems.reduce((sum, currentItem) => {
          const itemPrice = parseFloat(currentItem.product?.price || '0');
          return sum + (itemPrice * currentItem.quantity);
        }, 0)

        return {
          ...prevCart,
          items: newItems,
          total_price: newTotalPrice.toFixed(2), // Format back to string
        };
      })
    } catch (err) {
      console.error(`handleRemoveItem: Error removing item ${item.id}:`, err);
    } finally {
      setRemovingItemId(null);
    }

  }





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
          {/* Map over the cart items to display them */}
          {cart.items.map(item => (
            <div key={item.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Item details */}
              <div style={{ flexGrow: 1 }}>
                <h2>{item.product.name}</h2>
                <p>Price: ${parseFloat(item.product.price).toFixed(2)}</p>
              </div>

              {/* Quantity controls and Remove button */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Decrement button */}
                <button
                  onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                  // Disable if quantity is 1 or less, or if item is being updated/removed
                  disabled={item.quantity <= 1 || updatingItemId === item.id || removingItemId === item.id}
                  style={{ padding: '5px 10px', marginRight: '5px', borderRadius: '4px', border: '1px solid #ccc', cursor: (item.quantity <= 1 || updatingItemId === item.id || removingItemId === item.id) ? 'not-allowed' : 'pointer' }}
                >
                  -
                </button>
                <span style={{ margin: '0 5px' }}>{item.quantity}</span>
                {/* Increment button */}
                <button
                  onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                  // Disable if item is being updated/removed
                  disabled={updatingItemId === item.id || removingItemId === item.id}
                  style={{ padding: '5px 10px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc', cursor: (updatingItemId === item.id || removingItemId === item.id) ? 'not-allowed' : 'pointer' }}
                >
                  +
                </button>


                <button
                  onClick={() => handleRemoveItem(item)}
                  // Disable button while this item is being updated or removed
                  disabled={updatingItemId === item.id || removingItemId === item.id}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#dc3545', // Red color for remove
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: (updatingItemId === item.id || removingItemId === item.id) ? 'not-allowed' : 'pointer',
                    opacity: (updatingItemId === item.id || removingItemId === item.id) ? 0.6 : 1,
                  }}
                >
                  {removingItemId === item.id ? 'Removing...' : 'Remove'} {/* Button text changes */}
                </button>
              </div>
            </div>
          ))}

          {/* Display total price */}
          <div style={{ marginTop: '20px', fontSize: '1.2em', fontWeight: 'bold', textAlign: 'right' }}>
            Total: ${cart.total_price} {/* total_price is already a formatted string */}
          </div>

          {/* Will add Checkout button here later */}

        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}

    </div>
  );
}
