// src/components/superadmin/NoteList.jsx - Notes list for cafe details page
import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Calendar, Clock } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import TextArea from '../common/TextArea';
import Modal from '../common/Modal';

const NoteList = ({ notes, onAdd, onEdit, onDelete, cafeId }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    reminderDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({
        ...formData,
        cafeId,
        reminderDate: formData.reminderDate || null,
      });
      setIsAddModalOpen(false);
      setFormData({ title: '', content: '', reminderDate: '' });
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onEdit(editingNote._id, formData);
      setIsEditModalOpen(false);
      setEditingNote(null);
      setFormData({ title: '', content: '', reminderDate: '' });
    } catch (err) {
      console.error('Failed to edit note:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      reminderDate: note.reminderDate ? new Date(note.reminderDate).toISOString().slice(0, 16) : '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (noteId) => {
    if (window.confirm('Delete this note?')) {
      onDelete(noteId);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No reminder';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>
            Notes
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Add notes with reminders for this cafe
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1">
          <Plus size={16} /> Add Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
          <p>No notes yet. Add one to track important information.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note._id}
              className={`p-4 rounded-lg border transition-all ${
                note.isReminderActive && new Date(note.reminderDate) <= new Date()
                  ? 'border-red-300 bg-red-50/50'
                  : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{note.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{note.content}</p>
                  {note.reminderDate && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <Calendar size={12} />
                      <span>Reminder: {formatDate(note.reminderDate)}</span>
                      {new Date(note.reminderDate) <= new Date() && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-medium">Overdue</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 ml-4">
                  <button
                    onClick={() => openEditModal(note)}
                    className="p-1 hover:bg-primary/10 text-primary rounded-lg transition"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Note">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          <TextArea
            label="Content"
            name="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={3}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Date (optional)</label>
            <input
              type="datetime-local"
              value={formData.reminderDate}
              onChange={(e) => setFormData(prev => ({ ...prev, reminderDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--primary-color)' }}
            />
            <p className="text-xs text-gray-400 mt-1">When this date is reached, the cafe will appear at the top of the list.</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Add Note'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Note Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Note">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          <TextArea
            label="Content"
            name="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={3}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Date</label>
            <input
              type="datetime-local"
              value={formData.reminderDate}
              onChange={(e) => setFormData(prev => ({ ...prev, reminderDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--primary-color)' }}
            />
            <p className="text-xs text-gray-400 mt-1">Leave empty to remove reminder.</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Update Note'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NoteList;