// src/components/CartModal.jsx - Consistent UI with the rest of the app
import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, Send } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

const CartModal = ({ isOpen, onClose, cafeName, whatsappNumber, tables = [], slug }) => {
  const { cart, addToCart, removeFromCart, clearCart, getTotalItems, getTotalPrice, getOrderText } = useCart();
  const [selectedTable, setSelectedTable] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tableOptions = tables.length > 0 ? tables : ['1', '2', '3', '4', '5'];

  const getSessionId = () => {
    return sessionStorage.getItem('analyticsSessionId') || '';
  };

  const handlePlaceOrder = async () => {
    if (!selectedTable) {
      setError('Please select your table');
      return;
    }
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }
    if (!whatsappNumber) {
      setError('WhatsApp number not configured');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      if (slug) {
        try {
          await api.post(`/analytics/${slug}/order-attempt`, {
            sessionId: getSessionId(),
          });
        } catch (trackErr) {
          console.debug('Order attempt tracking failed:', trackErr.message);
        }
      }

      const orderText = getOrderText(selectedTable, cafeName);
      const url = `https://wa.me/${whatsappNumber}?text=${orderText}`;
      window.open(url, '_blank');

      if (slug) {
        try {
          await api.post(`/analytics/${slug}/order-completed`, {
            sessionId: getSessionId(),
            orderAmount: getTotalPrice(),
          });
        } catch (trackErr) {
          console.debug('Order completed tracking failed:', trackErr.message);
        }
      }

      clearCart();
      onClose();
      setSelectedTable('');
    } catch (err) {
      setError('Failed to place order. Please try again.');
      console.error('Order placement error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  if (cart.length === 0) {
    onClose();
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center bg-[#3E2723]/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-t-2xl md:rounded-2xl max-h-[90vh] flex flex-col bg-[var(--card-bg)] border-4 border-[var(--border-color)] shadow-primary">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4 border-[var(--border-color)] bg-[var(--bg-color)]">
          <h2 className="text-xl font-bold font-['Permanent_Marker'] text-[var(--text-color)]">
            Your Order ({getTotalItems()} items)
          </h2>
          <button
            onClick={onClose}
            className="p-1 border-2 border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-[var(--bg-color)] transition"
          >
            <X size={22} className="text-[var(--text-color)]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg-color)]">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-3 border-2 border-[var(--border-color)] p-3 bg-[var(--card-bg)] shadow-[4px_4px_0px_0px_var(--border-color)]"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-14 h-14 rounded-lg object-cover border-2 border-[var(--border-color)]"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[var(--text-color)] truncate">{item.title}</h4>
                <p className="text-sm font-bold text-primary">Rs. {item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="p-1 border-2 border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-[var(--bg-color)] transition"
                >
                  {item.quantity === 1 ? (
                    <Trash2 size={14} className="text-red-500" />
                  ) : (
                    <Minus size={14} className="text-[var(--text-color)]" />
                  )}
                </button>
                <span className="w-8 text-center font-bold text-[var(--text-color)]">{item.quantity}</span>
                <button
                  onClick={() => addToCart(item)}
                  className="p-1 border-2 border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-[var(--bg-color)] transition disabled:opacity-40"
                  disabled={!item.isAvailable}
                >
                  <Plus size={14} className="text-[var(--text-color)]" />
                </button>
              </div>
            </div>
          ))}
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm font-bold text-red-500 hover:underline"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-4 border-[var(--border-color)] p-4 space-y-3 bg-[var(--card-bg)]">
          <div>
            <label className="block text-sm font-bold text-[var(--text-color)] mb-1">
              Select Table <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTable}
              onChange={(e) => {
                setSelectedTable(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border-2 border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Choose your table --</option>
              {tableOptions.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-500 font-bold">{error}</p>}
          </div>

          <div className="flex items-center justify-between pt-2 border-t-2 border-[var(--border-color)]/20">
            <span className="font-bold text-[var(--text-color)]">Total:</span>
            <span className="text-2xl font-bold font-['Permanent_Marker'] text-primary">
              Rs. {getTotalPrice()}
            </span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="w-full py-3 bg-primary text-white font-bold border-2 border-[var(--border-color)] shadow-[6px_6px_0px_0px_var(--border-color)] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {isSubmitting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <Send size={20} /> Place Order via WhatsApp
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartModal;