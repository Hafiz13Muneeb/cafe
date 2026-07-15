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
      <div className="w-full max-w-lg rounded-t-2xl md:rounded-2xl max-h-[90vh] flex flex-col bg-white border-4 border-[#3E2723] shadow-[12px_12px_0px_0px_#8A9A5B]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4 border-[#3E2723] bg-[#F5F5DC]">
          <h2 className="text-xl font-bold font-['Permanent_Marker'] text-[#3E2723]">
            Your Order ({getTotalItems()} items)
          </h2>
          <button
            onClick={onClose}
            className="p-1 border-2 border-[#3E2723] bg-white hover:bg-[#EAE0C8] transition"
          >
            <X size={22} className="text-[#3E2723]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF9F6]">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-3 border-2 border-[#3E2723] p-3 bg-white shadow-[4px_4px_0px_0px_#EAE0C8]"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-14 h-14 rounded-lg object-cover border-2 border-[#3E2723]"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[#3E2723] truncate">{item.title}</h4>
                <p className="text-sm font-bold text-[#8A9A5B]">Rs. {item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="p-1 border-2 border-[#3E2723] bg-white hover:bg-[#EAE0C8] transition"
                >
                  {item.quantity === 1 ? (
                    <Trash2 size={14} className="text-red-500" />
                  ) : (
                    <Minus size={14} className="text-[#3E2723]" />
                  )}
                </button>
                <span className="w-8 text-center font-bold text-[#3E2723]">{item.quantity}</span>
                <button
                  onClick={() => addToCart(item)}
                  className="p-1 border-2 border-[#3E2723] bg-white hover:bg-[#EAE0C8] transition disabled:opacity-40"
                  disabled={!item.isAvailable}
                >
                  <Plus size={14} className="text-[#3E2723]" />
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
        <div className="border-t-4 border-[#3E2723] p-4 space-y-3 bg-white">
          <div>
            <label className="block text-sm font-bold text-[#3E2723] mb-1">
              Select Table <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTable}
              onChange={(e) => {
                setSelectedTable(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border-2 border-[#3E2723] bg-white text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#8A9A5B]"
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

          <div className="flex items-center justify-between pt-2 border-t-2 border-[#3E2723]/20">
            <span className="font-bold text-[#3E2723]">Total:</span>
            <span className="text-2xl font-bold font-['Permanent_Marker'] text-[#8A9A5B]">
              Rs. {getTotalPrice()}
            </span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="w-full py-3 bg-[#8A9A5B] text-white font-bold border-2 border-[#3E2723] shadow-[6px_6px_0px_0px_#3E2723] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
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