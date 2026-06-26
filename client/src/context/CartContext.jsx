// src/context/CartContext.jsx - Cart state management
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

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

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