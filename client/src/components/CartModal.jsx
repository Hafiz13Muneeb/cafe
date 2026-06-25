// src/components/CartModal.jsx - Light theme cart modal
import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, Send } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartModal = ({ isOpen, onClose, cafeName, whatsappNumber, tables = [] }) => {
  const { cart, addToCart, removeFromCart, clearCart, getTotalItems, getTotalPrice, formatPrice, getOrderText } = useCart();
  const [selectedTable, setSelectedTable] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tableOptions = tables.length > 0 ? tables : ['1','2','3','4','5'];

  const handlePlaceOrder = () => {
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
      const orderText = getOrderText(selectedTable, cafeName);
      const url = `https://wa.me/${whatsappNumber}?text=${orderText}`;
      window.open(url, '_blank');
      clearCart();
      onClose();
      setSelectedTable('');
    } catch (err) {
      setError('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  if (cart.length === 0) { onClose(); return null; }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl max-h-[90vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Your Order ({getTotalItems()} items)</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition">
            <X size={22} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map(item => (
            <div key={item._id} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
              <img src={item.imageUrl} alt={item.title} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-800 text-sm truncate">{item.title}</h4>
                <p className="text-sm font-semibold text-primary">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => removeFromCart(item._id)} className="p-1 bg-slate-200 hover:bg-slate-300 rounded-full transition">
                  {item.quantity === 1 ? <Trash2 size={14} className="text-red-500" /> : <Minus size={14} className="text-slate-600" />}
                </button>
                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                <button 
                  onClick={() => addToCart(item)} 
                  className="p-1 bg-slate-200 hover:bg-slate-300 rounded-full transition"
                  disabled={!item.isAvailable} // Disable if unavailable (defensive)
                >
                  <Plus size={14} className={item.isAvailable ? 'text-slate-600' : 'text-slate-400'} />
                </button>
              </div>
            </div>
          ))}
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 font-medium">Clear Cart</button>
          )}
        </div>

        <div className="border-t border-slate-100 p-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Select Table <span className="text-red-500">*</span></label>
            <select
              value={selectedTable}
              onChange={(e) => { setSelectedTable(e.target.value); setError(''); }}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Choose your table --</option>
              {tableOptions.map(table => <option key={table} value={table}>{table}</option>)}
            </select>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-slate-600">Total:</span>
            <span className="text-lg font-bold text-primary">{formatPrice(getTotalPrice())}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 ${
              isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:opacity-90 active:scale-95 shadow-md shadow-primary/20'
            }`}
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