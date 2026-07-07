// src/pages/SuperAdminNotifications.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import api from '../api/axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import TextArea from '../components/common/TextArea';
import Modal from '../components/common/Modal';
import { 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Send, 
  RefreshCw, 
  AlertCircle,
  Clock,
  Filter,
  Bell,
  Check,
  Eye,
  Reply
} from 'lucide-react';
import toast from 'react-hot-toast';

const SuperAdminNotifications = () => {
  const user = useSelector(selectUser);
  const [activeTab, setActiveTab] = useState('feedback'); // 'feedback' | 'notifications'

  // ============================================================
  // FEEDBACK STATE
  // ============================================================
  const [feedback, setFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('pending');
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackTotalPages, setFeedbackTotalPages] = useState(1);
  const [feedbackTotal, setFeedbackTotal] = useState(0);

  // Feedback detail modal
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackResponse, setFeedbackResponse] = useState('');
  const [feedbackStatusUpdate, setFeedbackStatusUpdate] = useState('pending');
  const [feedbackActionLoading, setFeedbackActionLoading] = useState(false);

  // ============================================================
  // NOTIFICATIONS STATE
  // ============================================================
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [notificationsTotalPages, setNotificationsTotalPages] = useState(1);
  const [notificationsTotal, setNotificationsTotal] = useState(0);

  // Send notification form
  const [sendFormOpen, setSendFormOpen] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('announcement');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationError, setNotificationError] = useState('');

  // Delete notification
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ============================================================
  // FETCH FUNCTIONS
  // ============================================================

  const fetchFeedback = async () => {
    setFeedbackLoading(true);
    setFeedbackError('');
    try {
      const res = await api.get(`/feedback?status=${feedbackStatusFilter}&page=${feedbackPage}&limit=10`);
      if (res.data.success) {
        setFeedback(res.data.data);
        setFeedbackTotal(res.data.pagination.total);
        setFeedbackTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      setFeedbackError(err.response?.data?.message || 'Failed to load feedback');
      toast.error('Failed to load feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError('');
    try {
      const res = await api.get(`/notifications?page=${notificationsPage}&limit=10`);
      if (res.data.success) {
        setNotifications(res.data.data);
        setNotificationsTotal(res.data.pagination.total);
        setNotificationsTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      setNotificationsError(err.response?.data?.message || 'Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedback();
    } else {
      fetchNotifications();
    }
  }, [activeTab, feedbackPage, notificationsPage, feedbackStatusFilter]);

  // ============================================================
  // FEEDBACK ACTIONS
  // ============================================================

  const handleFeedbackAction = async (action, feedbackId, data = {}) => {
    setFeedbackActionLoading(true);
    try {
      const payload = { status: action };
      if (action === 'resolved' && feedbackResponse.trim()) {
        payload.response = feedbackResponse.trim();
      }
      await api.patch(`/feedback/${feedbackId}/status`, payload);
      toast.success(`Feedback marked as ${action}`);
      fetchFeedback();
      setIsFeedbackModalOpen(false);
      setSelectedFeedback(null);
      setFeedbackResponse('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setFeedbackActionLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await api.delete(`/feedback/${feedbackId}`);
      toast.success('Feedback deleted');
      fetchFeedback();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const openFeedbackModal = (feedback) => {
    setSelectedFeedback(feedback);
    setFeedbackResponse(feedback.response || '');
    setFeedbackStatusUpdate(feedback.status);
    setIsFeedbackModalOpen(true);
  };

  // ============================================================
  // NOTIFICATION ACTIONS
  // ============================================================

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setNotificationError('');
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      setNotificationError('Title and message are required');
      return;
    }
    setSendingNotification(true);
    try {
      await api.post('/notifications', {
        title: notificationTitle.trim(),
        message: notificationMessage.trim(),
        type: notificationType,
        sendEmail,
      });
      toast.success('Notification sent successfully!');
      setSendFormOpen(false);
      setNotificationTitle('');
      setNotificationMessage('');
      setNotificationType('announcement');
      setSendEmail(true);
      fetchNotifications();
    } catch (err) {
      setNotificationError(err.response?.data?.message || 'Failed to send notification');
      toast.error('Failed to send notification');
    } finally {
      setSendingNotification(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await api.delete(`/notifications/${notificationId}`);
      toast.success('Notification deleted');
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // ============================================================
  // RENDER HELPERS
  // ============================================================

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
      spam: 'bg-red-100 text-red-800 border-red-300',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-bold border-2 border-[#3E2723] ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <DashboardLayout title="Notifications & Feedback" subtitle="Manage all communications">
      {/* Tab Navigation */}
      <div
        className="flex gap-1 border-2 border-[#3E2723] p-1 mb-6 w-full"
        style={{ backgroundColor: 'var(--secondary-color)' }}
      >
        <button
          onClick={() => setActiveTab('feedback')}
          className="flex-1 px-4 py-2 text-sm font-bold transition-all border-2"
          style={{
            backgroundColor: activeTab === 'feedback' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'feedback' ? '#ffffff' : 'var(--text-color)',
            borderColor: activeTab === 'feedback' ? '#3E2723' : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'feedback') {
              e.target.style.backgroundColor = 'rgba(var(--primary-color-rgb), 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'feedback') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          <MessageSquare size={16} className="inline mr-2" /> Feedback ({feedbackTotal})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className="flex-1 px-4 py-2 text-sm font-bold transition-all border-2"
          style={{
            backgroundColor: activeTab === 'notifications' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'notifications' ? '#ffffff' : 'var(--text-color)',
            borderColor: activeTab === 'notifications' ? '#3E2723' : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'notifications') {
              e.target.style.backgroundColor = 'rgba(var(--primary-color-rgb), 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'notifications') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Bell size={16} className="inline mr-2" /> Notifications ({notificationsTotal})
        </button>
      </div>

      {/* ============================================================
          FEEDBACK TAB
          ============================================================ */}
      {activeTab === 'feedback' && (
        <>
          {/* Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
              <select
                value={feedbackStatusFilter}
                onChange={(e) => setFeedbackStatusFilter(e.target.value)}
                className="px-3 py-1.5 border-2 border-[#3E2723] text-sm font-bold focus:outline-none"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-color)',
                }}
              >
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="spam">Spam</option>
              </select>
            </div>
            <Button
              variant="secondary"
              onClick={() => { setFeedbackPage(1); fetchFeedback(); }}
              className="text-sm"
            >
              <RefreshCw size={16} className="inline mr-1" /> Refresh
            </Button>
          </div>

          {/* Feedback List */}
          {feedbackLoading ? (
            <div
              className="border-2 border-[#3E2723] p-8 text-center"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <div
                className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent mb-2"
                style={{ borderColor: 'var(--primary-color) transparent transparent transparent' }}
              />
              <p style={{ color: 'var(--text-secondary)' }}>Loading feedback...</p>
            </div>
          ) : feedbackError ? (
            <div className="bg-red-100 border-2 border-red-500 p-4 text-center text-red-700 font-bold">
              {feedbackError}
            </div>
          ) : feedback.length === 0 ? (
            <div
              className="border-2 border-[#3E2723] p-8 text-center"
              style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-secondary)' }}
            >
              No feedback found.
            </div>
          ) : (
            <div className="space-y-3">
              {feedback.map((item) => (
                <div
                  key={item._id}
                  className="border-2 border-[#3E2723] p-4 transition-all"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--secondary-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold" style={{ color: 'var(--text-color)' }}>{item.email}</span>
                        {getStatusBadge(item.status)}
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm break-words" style={{ color: 'var(--text-secondary)' }}>{item.message}</p>
                      {item.response && (
                        <div
                          className="mt-2 p-2 border-l-4 text-sm"
                          style={{
                            backgroundColor: 'var(--bg-color)',
                            borderColor: 'var(--primary-color)',
                            color: 'var(--text-color)',
                          }}
                        >
                          <span className="font-bold">Response:</span> {item.response}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => openFeedbackModal(item)}
                        className="p-1.5 border-2 border-[#3E2723] transition"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary-color)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="View & respond"
                      >
                        <Eye size={16} style={{ color: 'var(--text-color)' }} />
                      </button>
                      <button
                        onClick={() => handleDeleteFeedback(item._id)}
                        className="p-1.5 border-2 border-[#3E2723] transition hover:bg-red-400"
                        style={{ backgroundColor: 'transparent' }}
                        title="Delete"
                      >
                        <Trash2 size={16} style={{ color: 'var(--text-color)' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {feedbackTotalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={feedbackPage <= 1}
                onClick={() => setFeedbackPage(p => Math.max(1, p - 1))}
                className="text-sm"
              >
                Previous
              </Button>
              <span className="px-3 py-1.5 text-sm font-bold" style={{ color: 'var(--text-color)' }}>
                Page {feedbackPage} of {feedbackTotalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={feedbackPage >= feedbackTotalPages}
                onClick={() => setFeedbackPage(p => Math.min(feedbackTotalPages, p + 1))}
                className="text-sm"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* ============================================================
          NOTIFICATIONS TAB
          ============================================================ */}
      {activeTab === 'notifications' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                {notificationsTotal} notification(s) sent
              </span>
            </div>
            <Button variant="primary" onClick={() => setSendFormOpen(true)}>
              <Bell size={16} className="inline mr-1" /> Send New
            </Button>
          </div>

          {notificationsLoading ? (
            <div
              className="border-2 border-[#3E2723] p-8 text-center"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <div
                className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent mb-2"
                style={{ borderColor: 'var(--primary-color) transparent transparent transparent' }}
              />
              <p style={{ color: 'var(--text-secondary)' }}>Loading notifications...</p>
            </div>
          ) : notificationsError ? (
            <div className="bg-red-100 border-2 border-red-500 p-4 text-center text-red-700 font-bold">
              {notificationsError}
            </div>
          ) : notifications.length === 0 ? (
            <div
              className="border-2 border-[#3E2723] p-8 text-center"
              style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-secondary)' }}
            >
              No notifications sent yet.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => (
                <div
                  key={item._id}
                  className="border-2 border-[#3E2723] p-4 transition-all"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--secondary-color)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold" style={{ color: 'var(--text-color)' }}>{item.title}</span>
                        <span
                          className="text-xs px-2 py-0.5 border-2 border-[#3E2723] font-bold"
                          style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)' }}
                        >
                          {item.type}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm break-words" style={{ color: 'var(--text-secondary)' }}>{item.message}</p>
                      <div className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Sent by: {item.sentBy?.username || 'Superadmin'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNotification(item._id)}
                      className="p-1.5 border-2 border-[#3E2723] transition hover:bg-red-400"
                      style={{ backgroundColor: 'transparent' }}
                      title="Delete"
                    >
                      <Trash2 size={16} style={{ color: 'var(--text-color)' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {notificationsTotalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={notificationsPage <= 1}
                onClick={() => setNotificationsPage(p => Math.max(1, p - 1))}
                className="text-sm"
              >
                Previous
              </Button>
              <span className="px-3 py-1.5 text-sm font-bold" style={{ color: 'var(--text-color)' }}>
                Page {notificationsPage} of {notificationsTotalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={notificationsPage >= notificationsTotalPages}
                onClick={() => setNotificationsPage(p => Math.min(notificationsTotalPages, p + 1))}
                className="text-sm"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* ============================================================
          FEEDBACK DETAIL MODAL
          ============================================================ */}
      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setSelectedFeedback(null);
          setFeedbackResponse('');
        }}
        title="Feedback Details"
        size="lg"
      >
        {selectedFeedback && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>From</p>
              <p className="text-base font-bold" style={{ color: 'var(--text-color)' }}>{selectedFeedback.email}</p>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Type</p>
              <p className="text-base capitalize" style={{ color: 'var(--text-color)' }}>{selectedFeedback.type || 'general'}</p>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Message</p>
              <div
                className="p-3 border-2 border-[#3E2723] text-sm whitespace-pre-wrap"
                style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
              >
                {selectedFeedback.message}
              </div>
            </div>
            {selectedFeedback.response && (
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Your Response</p>
                <div
                  className="p-3 border-2 border-[#3E2723] text-sm whitespace-pre-wrap"
                  style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)' }}
                >
                  {selectedFeedback.response}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Status</p>
              <div className="mt-1">{getStatusBadge(selectedFeedback.status)}</div>
            </div>

            <TextArea
              label="Admin Response (optional)"
              value={feedbackResponse}
              onChange={(e) => setFeedbackResponse(e.target.value)}
              rows={3}
              placeholder="Type your response here..."
            />

            <div className="flex flex-wrap gap-3 pt-2 border-t border-[#3E2723]/20">
              {selectedFeedback.status !== 'resolved' && (
                <Button
                  variant="primary"
                  onClick={() => handleFeedbackAction('resolved', selectedFeedback._id)}
                  disabled={feedbackActionLoading}
                  className="flex-1 justify-center"
                >
                  <Check size={16} className="inline mr-1" /> Resolve
                </Button>
              )}
              {selectedFeedback.status !== 'spam' && (
                <Button
                  variant="danger"
                  onClick={() => handleFeedbackAction('spam', selectedFeedback._id)}
                  disabled={feedbackActionLoading}
                  className="flex-1 justify-center"
                >
                  <XCircle size={16} className="inline mr-1" /> Mark as Spam
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => {
                  setIsFeedbackModalOpen(false);
                  setSelectedFeedback(null);
                  setFeedbackResponse('');
                }}
                className="flex-1 justify-center"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================
          SEND NOTIFICATION MODAL
          ============================================================ */}
      <Modal
        isOpen={sendFormOpen}
        onClose={() => {
          setSendFormOpen(false);
          setNotificationError('');
          setNotificationTitle('');
          setNotificationMessage('');
          setNotificationType('announcement');
          setSendEmail(true);
        }}
        title="Send Notification to All Owners"
        size="lg"
      >
        <form onSubmit={handleSendNotification} className="space-y-4">
          {notificationError && (
            <div className="p-3 border-2 border-red-500 bg-red-100 text-red-700 font-bold flex items-center gap-2 text-sm">
              <AlertCircle size={18} />
              <span>{notificationError}</span>
            </div>
          )}
          <Input
            label="Title"
            value={notificationTitle}
            onChange={(e) => setNotificationTitle(e.target.value)}
            required
            placeholder="Notification title..."
          />
          <TextArea
            label="Message"
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            rows={4}
            required
            placeholder="Write your message here..."
          />
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-color)' }}>Type</label>
            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value)}
              className="w-full px-3 py-2 border-2 border-[#3E2723] focus:outline-none"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
              }}
            >
              <option value="announcement">Announcement</option>
              <option value="system">System Update</option>
              <option value="update">Feature Update</option>
              <option value="feedback_response">Feedback Response</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="sendEmail"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="w-4 h-4 border-2 border-[#3E2723]"
            />
            <label htmlFor="sendEmail" className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>
              Also send email copies to all owners
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={sendingNotification}
              className="flex-1 justify-center"
            >
              {sendingNotification ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} className="inline mr-1" /> Send
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSendFormOpen(false)}
              className="flex-1 justify-center"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default SuperAdminNotifications;