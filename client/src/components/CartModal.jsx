// src/components/CartModal.jsx - Cart modal with dynamic theming and analytics tracking
import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, Send } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

const CartModal = ({ isOpen, onClose, cafeName, whatsappNumber, tables = [], slug, currency = 'Rs' }) => {
  const { cart, addToCart, removeFromCart, clearCart, getTotalItems, getTotalPrice, getOrderText } = useCart();
  const [selectedTable, setSelectedTable] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tableOptions = tables.length > 0 ? tables : ['1', '2', '3', '4', '5'];

  const getSessionId = () => {
    return sessionStorage.getItem('analyticsSessionId') || '';
  };

  // ✅ Local function to generate order text with the provided currency
  const getOrderTextWithCurrency = (tableNumber, cafeName) => {
    if (cart.length === 0) return '';

    let text = `New Order - ${cafeName || 'Cafe'}\n`;
    text += `Table: ${tableNumber}\n`;
    text += `---\n`;

    cart.forEach((item) => {
      text += `${item.quantity}x ${item.title} - ${currency}${item.price}\n`;
    });

    text += `---\n`;
    text += `Total: ${currency}${getTotalPrice()}`;

    return encodeURIComponent(text);
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

      // ✅ Use the local function with currency
      const orderText = getOrderTextWithCurrency(selectedTable, cafeName);
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
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center bg-black/30 backdrop-blur-sm animate-fade-in p-4">
      <div
        className="w-full max-w-lg rounded-t-2xl md:rounded-2xl max-h-[90vh] flex flex-col animate-slide-up"
        style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
      >
        <div className="flex items-center justify-between p-3 sm:p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text-color)' }}>
            Your Order ({getTotalItems()} items)
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition hover:opacity-70"
            style={{ backgroundColor: 'var(--bg-color)' }}
          >
            <X size={22} style={{ color: 'var(--text-color)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-3 rounded-lg p-3"
              style={{ backgroundColor: 'var(--bg-color)' }}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-color)' }}>
                  {item.title}
                </h4>
                <p className="text-sm font-semibold" style={{ color: 'var(--primary-color)' }}>
                  {currency}{item.price}
                </p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="p-1 rounded-full transition hover:opacity-70"
                  style={{ backgroundColor: 'var(--border-color)' }}
                >
                  {item.quantity === 1 ? (
                    <Trash2 size={14} className="text-red-500" />
                  ) : (
                    <Minus size={14} style={{ color: 'var(--text-color)' }} />
                  )}
                </button>
                <span className="w-6 text-center text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => addToCart(item)}
                  className="p-1 rounded-full transition hover:opacity-70"
                  style={{ backgroundColor: 'var(--border-color)' }}
                  disabled={!item.isAvailable}
                >
                  <Plus
                    size={14}
                    style={{ color: item.isAvailable ? 'var(--text-color)' : 'var(--text-secondary)' }}
                  />
                </button>
              </div>
            </div>
          ))}
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm font-medium hover:underline"
              style={{ color: '#ef4444' }}
            >
              Clear Cart
            </button>
          )}
        </div>

        <div className="border-t p-3 sm:p-4 space-y-3" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
              Select Table <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTable}
              onChange={(e) => {
                setSelectedTable(e.target.value);
                setError('');
              }}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
              style={{
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-color)',
                focusRing: 'var(--primary-color)',
              }}
            >
              <option value="">-- Choose your table --</option>
              {tableOptions.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <span style={{ color: 'var(--text-secondary, #64748b)' }}>Total:</span>
            <span className="text-lg font-bold" style={{ color: 'var(--primary-color)' }}>
              {currency}{getTotalPrice()}
            </span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="w-full py-2.5 sm:py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 text-sm sm:text-base"
            style={{
              backgroundColor: isSubmitting ? 'var(--border-color)' : 'var(--primary-color)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: isSubmitting ? 'none' : '0 4px 15px rgba(0,0,0,0.15)',
            }}
          >
            {isSubmitting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <Send size={18} />
                Place Order via WhatsApp
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartModal;