// src/pages/OwnerFAQManagement.jsx - FAQ CRUD page for the owner
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import TextArea from '../components/common/TextArea';
import Modal from '../components/common/Modal';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

const OwnerFAQManagement = () => {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({ question: '', answer: '', order: 0 });
  const [formLoading, setFormLoading] = useState(false);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/faqs/all');
      if (res.data.success) {
        setFaqs(res.data.data);
      } else {
        setError('Failed to load FAQs');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load FAQs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  // Auto-clear messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const resetForm = () => {
    setFormData({ question: '', answer: '', order: 0 });
    setEditingFaq(null);
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    resetForm();
    const nextOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.order || 0)) + 1 : 0;
    setFormData({ question: '', answer: '', order: nextOrder });
    setIsModalOpen(true);
  };

  const openEditModal = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      order: faq.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'order' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      order: formData.order || 0,
    };

    try {
      let res;
      if (editingFaq) {
        res = await api.put(`/faqs/${editingFaq._id}`, payload);
      } else {
        res = await api.post('/faqs', payload);
      }
      if (res.data.success) {
        setSuccess(editingFaq ? 'FAQ updated successfully!' : 'FAQ added successfully!');
        fetchFAQs();
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save FAQ');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await api.delete(`/faqs/${id}`);
      setSuccess('FAQ deleted successfully');
      fetchFAQs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete FAQ');
    }
  };

  const handleToggleActive = async (faq) => {
    try {
      await api.put(`/faqs/${faq._id}`, { isActive: !faq.isActive });
      setSuccess(`FAQ ${faq.isActive ? 'disabled' : 'enabled'} successfully`);
      fetchFAQs();
    } catch (err) {
      setError('Failed to update FAQ status');
    }
  };

  const moveFAQ = async (faq, direction) => {
    const index = faqs.findIndex(f => f._id === faq._id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === faqs.length - 1)) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const otherFaq = faqs[newIndex];

    const faqOrder = faq.order || 0;
    const otherOrder = otherFaq.order || 0;

    try {
      await api.put(`/faqs/${faq._id}`, { order: otherOrder });
      await api.put(`/faqs/${otherFaq._id}`, { order: faqOrder });
      fetchFAQs();
      setSuccess('FAQ reordered successfully');
    } catch (err) {
      setError('Failed to reorder FAQs');
    }
  };

  return (
    <DashboardLayout title="FAQ Management" subtitle={user?.cafeName}>
      {error && (
        <div className="mb-4 p-3 border-2 border-[var(--border-color)] bg-red-300 text-[var(--text-color)] font-bold text-sm sm:text-base">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 border-2 border-[var(--border-color)] bg-primary text-white font-bold text-sm sm:text-base">
          {success}
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="text-xl font-bold font-['Permanent_Marker'] text-[var(--text-color)]">
          Manage Customer FAQs
        </h2>
        <Button variant="primary" onClick={openAddModal}>
          <Plus size={16} className="inline mr-1" /> Add FAQ
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-[var(--text-color)]/60">Loading FAQs...</div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-[var(--border-color)] text-[var(--text-color)]/60">
          No FAQs yet. Click "Add FAQ" to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq._id}
              className={`border-2 border-[var(--border-color)] p-4 bg-[var(--card-bg)] shadow-[4px_4px_0px_0px_var(--border-color)] ${
                !faq.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-[var(--text-color)]">{faq.question}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 border-2 border-[var(--border-color)] font-bold ${
                        faq.isActive ? 'bg-primary text-white' : 'bg-gray-300'
                      }`}
                    >
                      {faq.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-color)]/70 mt-1">{faq.answer}</p>
                  <p className="text-xs text-[var(--text-color)]/40 mt-1">Order: {faq.order || 0}</p>
                </div>
                <div className="flex flex-wrap gap-1 flex-shrink-0">
                  <button
                    onClick={() => moveFAQ(faq, 'up')}
                    disabled={index === 0}
                    className="p-1 border-2 border-[var(--border-color)] hover:bg-[var(--bg-color)] disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveFAQ(faq, 'down')}
                    disabled={index === faqs.length - 1}
                    className="p-1 border-2 border-[var(--border-color)] hover:bg-[var(--bg-color)] disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => handleToggleActive(faq)}
                    className="p-1 border-2 border-[var(--border-color)] hover:bg-[var(--bg-color)]"
                    title={faq.isActive ? 'Disable' : 'Enable'}
                  >
                    {faq.isActive ? '🔇' : '🔊'}
                  </button>
                  <button
                    onClick={() => openEditModal(faq)}
                    className="p-1 border-2 border-[var(--border-color)] hover:bg-[var(--bg-color)]"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(faq._id)}
                    className="p-1 border-2 border-[var(--border-color)] hover:bg-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Question"
            name="question"
            value={formData.question}
            onChange={handleFormChange}
            required
            placeholder="e.g. How do I place an order?"
          />
          <TextArea
            label="Answer"
            name="answer"
            value={formData.answer}
            onChange={handleFormChange}
            required
            rows={4}
            placeholder="Write a clear answer..."
          />
          <Input
            label="Order (display priority)"
            name="order"
            type="number"
            value={formData.order}
            onChange={handleFormChange}
            placeholder="0"
            min="0"
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" disabled={formLoading} className="flex-1 justify-center">
              {formLoading ? 'Saving...' : editingFaq ? 'Update FAQ' : 'Add FAQ'}
            </Button>
            <Button type="button" variant="secondary" onClick={resetForm} className="flex-1 justify-center">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default OwnerFAQManagement;