// src/pages/CustomerMenu.jsx - Public menu with analytics tracking
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPublicMenu } from '../api/axios';
import { useCart } from '../context/CartContext';
import MenuItemCard from '../components/MenuItemCard';
import CartFloatingButton from '../components/CartFloatingButton';
import CartModal from '../components/CartModal';
import { Coffee, Utensils } from 'lucide-react';
import api from '../api/axios';

const CustomerMenu = () => {
  const { slug } = useParams();
  const { getTotalItems, getTotalPrice } = useCart();

  const [cafeData, setCafeData] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('analyticsSessionId');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('analyticsSessionId', sessionId);
    }
    return sessionId;
  };

  useEffect(() => {
    const trackView = async () => {
      try {
        const sessionId = getSessionId();
        await api.post(`/analytics/${slug}/view`, { sessionId });
      } catch (err) {
        console.debug('View tracking failed:', err.message);
      }
    };
    if (slug) trackView();
  }, [slug]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return menuItems;
    return menuItems.filter(item => item.category === selectedCategory);
  }, [menuItems, selectedCategory]);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetchPublicMenu(slug);
        const { cafe, menu, categories: catList } = response.data;

        setCafeData(cafe);
        setMenuItems(menu);
        setCategories(['all', ...(catList || [])]);
      } catch (err) {
        console.error('Error loading menu:', err);
        setError(err.response?.data?.message || 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, [slug]);

  useEffect(() => {
    if (cafeData?.theme) {
      const root = document.documentElement;
      const { primaryColor, secondaryColor, mode } = cafeData.theme;
      root.style.setProperty('--primary-color', primaryColor || '#d4a843');
      root.style.setProperty('--secondary-color', secondaryColor || '#b8860b');
    }
  }, [cafeData]);

  useEffect(() => {
    if (cafeData?.faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.rel = 'icon';
      link.href = cafeData.faviconUrl;
      if (!document.querySelector("link[rel*='icon']")) {
        document.head.appendChild(link);
      }
    }
  }, [cafeData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC] text-[#3E2723]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-[#8A9A5B]" />
          <p className="mt-4 font-bold font-['Permanent_Marker'] text-lg sm:text-xl">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC] text-[#3E2723] px-4">
        <div className="text-center p-6 sm:p-8 border-4 border-[#3E2723] bg-white shadow-[8px_8px_0px_0px_#8A9A5B] max-w-sm w-full">
          <Utensils size={48} className="mx-auto mb-4 text-[#3E2723]/30" />
          <h2 className="text-2xl font-bold font-['Permanent_Marker'] mb-2">Oops!</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen bg-[#F5F5DC] text-[#3E2723] pb-28">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b-4 border-[#3E2723] shadow-[4px_4px_0px_0px_#8A9A5B] py-2 sm:py-3 px-3 sm:px-4 flex items-center gap-3 sm:gap-4">
        {cafeData?.logoUrl ? (
          <img src={cafeData.logoUrl} alt="Cafe logo" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-[#3E2723] object-cover" />
        ) : (
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-[#3E2723] bg-[#8A9A5B] flex items-center justify-center">
            <Coffee size={24} className="text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold font-['Permanent_Marker'] truncate">
            {cafeData?.name || 'Cafe Menu'}
          </h1>
          {cafeData?.whatsappNumber && (
            <p className="text-xs font-bold text-[#3E2723]/60">📱 Order via WhatsApp</p>
          )}
        </div>
        <div className="border-2 border-[#3E2723] bg-[#EAE0C8] px-2 sm:px-3 py-1 font-bold text-xs sm:text-sm">
          {menuItems.length} items
        </div>
      </header>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="sticky top-[68px] sm:top-[76px] z-10 bg-[#F5F5DC] border-b-2 border-[#3E2723] py-1 sm:py-2 px-3 sm:px-4">
          <div className="flex gap-1 bg-[#EAE0C8] border-2 border-[#3E2723] p-1 w-max overflow-x-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#8A9A5B] text-white border-2 border-[#3E2723]'
                    : 'text-[#3E2723] hover:bg-[#3E2723]/10'
                }`}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Grid */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-base sm:text-lg font-bold text-[#3E2723]/50">No items in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart */}
      {totalItems > 0 && (
        <CartFloatingButton
          totalItems={totalItems}
          totalPrice={totalPrice}
          onClick={() => setIsCartOpen(true)}
        />
      )}

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cafeName={cafeData?.name || 'Cafe'}
        whatsappNumber={cafeData?.whatsappNumber || ''}
        tables={cafeData?.tables || []}
        slug={slug}
      />
    </div>
  );
};

export default CustomerMenu;