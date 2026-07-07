// src/pages/CustomerMenu.jsx - Public menu with analytics tracking
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchPublicMenu } from '../api/axios';
import { selectTotalItems, selectTotalPrice } from '../store/slices/cartSlice';
import MenuItemCard from '../components/MenuItemCard';
import CartFloatingButton from '../components/CartFloatingButton';
import CartModal from '../components/CartModal';
import { Coffee, Utensils } from 'lucide-react';
import api from '../api/axios';

const CustomerMenu = () => {
  const { slug } = useParams();
  const totalItems = useSelector(selectTotalItems);
  const totalPrice = useSelector(selectTotalPrice);

  const [cafeData, setCafeData] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currency, setCurrency] = useState('Rs');

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
        setCurrency(cafe?.currency || 'Rs');
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
      >
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
            style={{ borderColor: 'var(--primary-color) transparent transparent transparent' }}
          />
          <p className="mt-4 font-bold font-['Permanent_Marker'] text-lg sm:text-xl" style={{ color: 'var(--text-color)' }}>
            Loading menu...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
      >
        <div
          className="text-center p-6 sm:p-8 border-4 border-[#3E2723] max-w-sm w-full"
          style={{
            backgroundColor: 'var(--card-bg)',
            boxShadow: '8px 8px 0px 0px var(--primary-color)',
          }}
        >
          <Utensils size={48} className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
          <h2 className="text-2xl font-bold font-['Permanent_Marker'] mb-2" style={{ color: 'var(--text-color)' }}>
            Oops!
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-28"
      style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-20 border-b-4 border-[#3E2723] py-2 sm:py-3 px-3 sm:px-4 flex items-center gap-3 sm:gap-4"
        style={{
          backgroundColor: 'var(--card-bg)',
          boxShadow: '4px 4px 0px 0px var(--primary-color)',
        }}
      >
        {cafeData?.logoUrl ? (
          <img
            src={cafeData.logoUrl}
            alt="Cafe logo"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-[#3E2723] object-cover"
          />
        ) : (
          <div
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-[#3E2723] flex items-center justify-center"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <Coffee size={24} className="text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold font-['Permanent_Marker'] truncate" style={{ color: 'var(--text-color)' }}>
            {cafeData?.name || 'Cafe Menu'}
          </h1>
          {cafeData?.whatsappNumber && (
            <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              📱 Order via WhatsApp
            </p>
          )}
        </div>
        <div
          className="border-2 border-[#3E2723] px-2 sm:px-3 py-1 font-bold text-xs sm:text-sm"
          style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)' }}
        >
          {menuItems.length} items
        </div>
      </header>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div
          className="sticky top-[68px] sm:top-[76px] z-10 border-b-2 border-[#3E2723] py-1 sm:py-2 px-3 sm:px-4"
          style={{ backgroundColor: 'var(--bg-color)' }}
        >
          <div
            className="flex gap-1 border-2 border-[#3E2723] p-1 w-max overflow-x-auto max-w-full"
            style={{ backgroundColor: 'var(--secondary-color)' }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold transition-all whitespace-nowrap"
                style={{
                  backgroundColor: selectedCategory === cat ? 'var(--primary-color)' : 'transparent',
                  color: selectedCategory === cat ? '#ffffff' : 'var(--text-color)',
                  border: selectedCategory === cat ? '2px solid #3E2723' : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat) {
                    e.target.style.backgroundColor = 'rgba(var(--primary-color-rgb), 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
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
            <p className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-secondary)' }}>
              No items in this category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard key={item._id} item={item} currency={currency} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart */}
      {totalItems > 0 && (
        <CartFloatingButton
          currency={currency}
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
        currency={currency}
      />
    </div>
  );
};

export default CustomerMenu;