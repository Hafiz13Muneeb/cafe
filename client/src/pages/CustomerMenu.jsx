// src/pages/CustomerMenu.jsx - Dynamic customer menu with theme from backend
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import api, { fetchPublicMenu } from '../api/axios';
import MenuItemCard from '../components/MenuItemCard';
import CategoryFilter from '../components/CategoryFilter';
import CartFloatingButton from '../components/CartFloatingButton';
import CartModal from '../components/CartModal';

// Skeleton loader (inline)
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
  const { slug } = useParams(); // Get cafe slug from URL
  const { loadThemeFromSlug, theme, cafeSettings } = useTheme();
  const { cart, getTotalItems, getTotalPrice } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);

  // Cafe details (from API)
  const [cafeName, setCafeName] = useState('Cafe');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [tables, setTables] = useState(['1', '2', '3', '4', '5']);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch public menu data using the slug
        const response = await fetchPublicMenu(slug);
        const { cafe, menu, categories: catList } = response.data;

        // Set cafe details
        setCafeName(cafe.name || 'Cafe');
        setWhatsappNumber(cafe.whatsappNumber || '');
        setLogoUrl(cafe.logoUrl || '');
        setFaviconUrl(cafe.faviconUrl || '');
        setTables(cafe.tables || ['1', '2', '3', '4', '5']);

        // Apply theme from cafe settings
        if (cafe.theme) {
          await loadThemeFromSlug(slug); // This updates the theme context
        }

        // Set menu items and categories
        setMenuItems(menu || []);
        setFilteredItems(menu || []);
        if (catList && catList.length > 0) {
          setCategories(['all', ...catList]);
        } else {
          setCategories(['all']);
        }
      } catch (err) {
        console.error('Error loading menu:', err);
        // Handle different error statuses
        if (err.response?.status === 404) {
          setError('Cafe not found. Please check the URL.');
        } else if (err.response?.status === 403) {
          setError('This cafe is currently unavailable. It has been blocked by the administrator.');
        } else {
          // Use server message if available, otherwise fallback
          const serverMsg = err.response?.data?.message;
          setError(serverMsg || 'Failed to load menu. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadMenu();
    } else {
      setError('Invalid cafe slug');
      setLoading(false);
    }
  }, [slug, loadThemeFromSlug]);

  // Update favicon when it changes
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

  // Filter items when category changes
  useEffect(() => {
    setFilteredItems(
      selectedCategory === 'all'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory)
    );
  }, [selectedCategory, menuItems]);

  if (loading) {
    return (
      <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
        <header className="shadow-sm sticky top-0 z-10 border-b" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
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

  if (error) {
    const isBlocked = error.includes('blocked');
    const isNotFound = error.includes('not found');
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
        <div className="text-center max-w-md mx-auto p-6">
          {isBlocked ? (
            <>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-4xl">🚫</span>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Cafe Unavailable</h2>
              <p className="text-gray-600">{error}</p>
              <p className="text-sm text-gray-400 mt-4">Please contact the cafe owner for more information.</p>
            </>
          ) : isNotFound ? (
            <>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-4xl">🔍</span>
              </div>
              <h2 className="text-2xl font-bold text-yellow-600 mb-2">Cafe Not Found</h2>
              <p className="text-gray-600">{error}</p>
              <p className="text-sm text-gray-400 mt-4">The cafe you are looking for does not exist or may have been removed.</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-4xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-red-500 mb-2">Oops!</h2>
              <p className="text-gray-600">{error}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <header
        className="shadow-sm sticky top-0 z-10 border-b"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={cafeName} className="h-10 w-auto object-contain" />
          ) : (
            <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>
              {cafeName}
            </h1>
          )}
          <p className="text-sm ml-auto opacity-70" style={{ color: 'var(--text-color)' }}>
            Scan & Order
          </p>
        </div>
      </header>

      <div
        className="sticky top-[72px] z-10 border-b"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
      >
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
          <div className="text-center py-12 opacity-70" style={{ color: 'var(--text-color)' }}>
            No items available
          </div>
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