// src/context/CartContext.jsx - Cart state management with cross-tab sync
import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Load cart from localStorage if available
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes (only in this tab)
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // 🆕 Cross-tab synchronization: listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Only react to changes to the 'cart' key
      if (e.key === 'cart') {
        // The new value is in e.newValue (string or null if removed)
        if (e.newValue) {
          try {
            const newCart = JSON.parse(e.newValue);
            // Update the state only if the new cart is different (prevents unnecessary re-renders)
            setCart((prevCart) => {
              // Simple comparison: stringify both and compare
              if (JSON.stringify(prevCart) !== JSON.stringify(newCart)) {
                return newCart;
              }
              return prevCart;
            });
          } catch (err) {
            console.error('Failed to parse cart from storage event:', err);
          }
        } else {
          // If the cart was removed from storage, clear the state
          setCart([]);
        }
      }
    };

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array: run only once on mount

  // Add item to cart
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i._id === item._id);
      if (existingItem) {
        return prevCart.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  // Remove item from cart (decrease quantity or remove entirely)
  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i._id === itemId);
      if (!existingItem) return prevCart;
      if (existingItem.quantity === 1) {
        return prevCart.filter((i) => i._id !== itemId);
      }
      return prevCart.map((i) =>
        i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Get total items count
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Get total price
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Format price in PKR (or your currency)
  const formatPrice = (price) => {
    return `Rs. ${price}`;
  };

  // Generate order text for WhatsApp – supports dynamic cafe name
  const getOrderText = (tableNumber, cafeName) => {
    if (cart.length === 0) return '';

    let text = `New Order - ${cafeName || 'Cafe'}\n`;
    text += `Table: ${tableNumber}\n`;
    text += `---\n`;

    cart.forEach((item) => {
      text += `${item.quantity}x ${item.title} - Rs.${item.price}\n`;
    });

    text += `---\n`;
    text += `Total: Rs.${getTotalPrice()}`;

    return encodeURIComponent(text);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    formatPrice,
    getOrderText,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};