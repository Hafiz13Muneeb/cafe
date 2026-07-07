// src/components/common/NotificationBell.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { Bell, Check, X, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Button from '../common/Button';

const NotificationBell = () => {
  const user = useSelector(selectUser);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const intervalRef = useRef(null);

  // ✅ Single API call – summary endpoint
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get('/notifications/summary');
      if (res.data.success) {
        setUnreadCount(res.data.data.unreadCount || 0);
        setNotifications(res.data.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mount: fetch & set polling (60s, only when visible)
  useEffect(() => {
    fetchNotifications();

    const startInterval = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchNotifications();
        }
      }, 60000); // 60 seconds
    };

    startInterval();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications(); // refresh immediately
        if (!intervalRef.current) {
          startInterval(); // restart interval if it was cleared
        }
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Fetch fresh data when dropdown is opened
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      // Update local state
      setNotifications(notifications.filter(n => n._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Notification marked as read');
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const openNotification = (notif) => {
    setSelectedNotif(notif);
    setIsModalOpen(true);
    if (!notif.isRead) {
      handleMarkAsRead(notif._id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotif(null);
  };

  const handleDelete = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif._id);
    } else {
      setNotifications(notifications.filter(n => n._id !== notif._id));
    }
    closeModal();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 sm:p-2 border-2 border-[#3E2723] transition"
        style={{
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-color)',
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--secondary-color)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--card-bg)'}
        aria-label="Notifications"
      >
        <Bell size={18} className="sm:w-5 sm:h-5" style={{ color: 'var(--text-color)' }} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse-dot border-2 border-[#3E2723]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 border-2 border-[#3E2723] shadow-[8px_8px_0px_0px_#3E2723] z-50 max-h-[400px] flex flex-col"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          <div className="p-3 border-b-2 border-[#3E2723] flex items-center justify-between">
            <h3 className="font-bold" style={{ color: 'var(--text-color)' }}>Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="text-xs font-bold hover:underline disabled:opacity-50"
                  style={{ color: 'var(--primary-color)' }}
                >
                  {markingAll ? '...' : 'Mark all read'}
                </button>
              )}
              <button
                onClick={() => {
                  fetchNotifications();
                  toast.success('Refreshed');
                }}
                className="text-xs font-bold transition hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Check size={20} className="inline mr-1" /> All caught up!
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className="p-2 border-2 transition cursor-pointer"
                  style={{
                    borderColor: 'var(--border-color)',
                  }}
                  onMouseEnter={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                  onMouseLeave={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  onClick={() => openNotification(notif)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: 'var(--text-color)' }}>{notif.title}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{notif.message}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t-2 border-[#3E2723] text-center">
            <Link
              to={user?.role === 'superadmin' ? '/admin/notifications' : '#'}
              className="text-xs font-bold hover:underline block"
              style={{ color: 'var(--primary-color)' }}
            >
              {user?.role === 'superadmin' ? 'Manage all notifications' : 'View all'}
            </Link>
          </div>
        </div>
      )}

      {/* Modal for full message */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedNotif?.title || 'Notification'}
        size="lg"
      >
        {selectedNotif && (
          <>
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              {new Date(selectedNotif.createdAt).toLocaleString()}
            </p>
            <div
              className="p-4 border-2 border-[#3E2723] whitespace-pre-wrap text-sm"
              style={{
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
              }}
            >
              {selectedNotif.message}
            </div>
            <div className="mt-4 flex gap-3">
              <Button variant="secondary" onClick={closeModal} className="flex-1 justify-center">
                Close
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(selectedNotif)}
                className="flex-1 justify-center"
              >
                Delete / Dismiss
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default NotificationBell;