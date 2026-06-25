// src/pages/CustomerMenu.jsx - Light theme customer menu
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import MenuItemCard from '../components/MenuItemCard';
import CategoryFilter from '../components/CategoryFilter';
import CartFloatingButton from '../components/CartFloatingButton';
import CartModal from '../components/CartModal';

// Skeleton loader component (inline for simplicity)
const MenuSkeleton = () => (
  <div className="grid grid-cols-2 gap-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="aspect-square bg-slate-200 animate-pulse" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
          <div className="flex justify-between items-center mt-2">
            <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse" />
            <div className="h-7 bg-slate-200 rounded w-16 animate-pulse" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const CustomerMenu = () => {
  const { theme } = useTheme();
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState(['all']); // Default to ['all']
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);
  const [cafeName, setCafeName] = useState('Cafe');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [tables, setTables] = useState([]);
  const { cart, getTotalItems, getTotalPrice } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [menuRes, settingsRes] = await Promise.all([
          api.get('/menu'),
          api.get('/settings'),
        ]);
        if (menuRes.data.success) {
          const items = menuRes.data.data || [];
          setMenuItems(items);
          setFilteredItems(items);
          // Safely extract categories – handle empty array
          const categoryList = items.length 
            ? ['all', ...new Set(items.map(item => item.category))]
            : ['all'];
          setCategories(categoryList);
        }
        if (settingsRes.data.success) {
          const data = settingsRes.data.data;
          setCafeName(data.cafeName || 'Cafe');
          setWhatsappNumber(data.whatsappNumber || '');
          setLogoUrl(data.logoUrl || '');
          setFaviconUrl(data.faviconUrl || '');
          setTables(data.tables || ['1','2','3','4','5']);
        }
      } catch (err) {
        setError('Failed to load menu. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update favicon
  useEffect(() => {
    if (faviconUrl) {
      const link = document.querySelector("link[rel*='icon']");
      if (link) link.remove();
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = faviconUrl;
      document.head.appendChild(newLink);
    }
  }, [faviconUrl]);

  // Filter items
  useEffect(() => {
    setFilteredItems(
      selectedCategory === 'all'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory)
    );
  }, [selectedCategory, menuItems]);

  // Show skeleton while loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-slate-100">
          <div className="container mx-auto px-4 py-4 flex items-center gap-3">
            <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-slate-200 rounded ml-auto animate-pulse" />
          </div>
        </header>
        <div className="sticky top-[72px] z-10 bg-white border-b border-slate-100">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-2 overflow-x-auto">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 w-16 bg-slate-200 rounded-full animate-pulse flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-4">
          <MenuSkeleton />
        </div>
      </div>
    );
  }

  if (error) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-slate-100">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={cafeName} className="h-10 w-auto object-contain" />
          ) : (
            <h1 className="text-2xl font-bold text-slate-900">{cafeName}</h1>
          )}
          <p className="text-sm text-slate-500 ml-auto">Scan & Order</p>
        </div>
      </header>

      <div className="sticky top-[72px] z-10 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 py-3 overflow-x-auto scrollbar-hide">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No items available</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <MenuItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <CartFloatingButton
          totalItems={getTotalItems()}
          totalPrice={getTotalPrice()}
          onClick={() => setShowCartModal(true)}
        />
      )}

      <CartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        cafeName={cafeName}
        whatsappNumber={whatsappNumber}
        tables={tables}
      />
    </div>
  );
};

export default CustomerMenu;