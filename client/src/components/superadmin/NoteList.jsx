// src/components/superadmin/NoteList.jsx - Full note management with add/edit/delete
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, X, Save } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import TextArea from '../common/TextArea';
import Modal from '../common/Modal';

const NoteList = ({ notes, onAdd, onEdit, onDelete, cafeId, loading = false }) => {
  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: '',
    content: '',
    reminderDate: '',
    isReminderActive: false,
  });
  const [addLoading, setAddLoading] = useState(false);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    reminderDate: '',
    isReminderActive: false,
  });
  const [editLoading, setEditLoading] = useState(false);

  // Reset add form when modal closes
  useEffect(() => {
    if (!isAddModalOpen) {
      setAddFormData({ title: '', content: '', reminderDate: '', isReminderActive: false });
      setAddLoading(false);
    }
  }, [isAddModalOpen]);

  // Reset edit form when modal closes
  useEffect(() => {
    if (!isEditModalOpen) {
      setEditingNote(null);
      setEditFormData({ title: '', content: '', reminderDate: '', isReminderActive: false });
      setEditLoading(false);
    }
  }, [isEditModalOpen]);

  // Handle add form changes
  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Open edit modal with note data
  const openEditModal = (note) => {
    setEditingNote(note);
    setEditFormData({
      title: note.title || '',
      content: note.content || '',
      reminderDate: note.reminderDate ? new Date(note.reminderDate).toISOString().slice(0, 16) : '',
      isReminderActive: note.isReminderActive || false,
    });
    setIsEditModalOpen(true);
  };

  // Handle add submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.title.trim() || !addFormData.content.trim()) {
      alert('Title and content are required');
      return;
    }
    // ✅ Validation: if reminder is active, a date must be provided
    if (addFormData.isReminderActive && !addFormData.reminderDate) {
      alert('Please select a reminder date and time when the reminder is active.');
      return;
    }

    setAddLoading(true);
    try {
      await onAdd({
        cafeId,
        title: addFormData.title.trim(),
        content: addFormData.content.trim(),
        reminderDate: addFormData.reminderDate || null,
        // ✅ Fix: use the checkbox value directly
        isReminderActive: addFormData.isReminderActive,
      });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setAddLoading(false);
    }
  };

  // Handle edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim() || !editFormData.content.trim()) {
      alert('Title and content are required');
      return;
    }
    // ✅ Validation: if reminder is active, a date must be provided
    if (editFormData.isReminderActive && !editFormData.reminderDate) {
      alert('Please select a reminder date and time when the reminder is active.');
      return;
    }

    setEditLoading(true);
    try {
      await onEdit(editingNote._id, {
        title: editFormData.title.trim(),
        content: editFormData.content.trim(),
        reminderDate: editFormData.reminderDate || null,
        // ✅ Fix: use the checkbox value directly
        isReminderActive: editFormData.isReminderActive,
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update note:', err);
    } finally {
      setEditLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No reminder';
    const date = new Date(dateString);
    return date.toLocaleString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if reminder is active and due
  const isReminderDue = (note) => {
    if (!note.isReminderActive || !note.reminderDate) return false;
    return new Date(note.reminderDate) <= new Date();
  };

  if (loading) {
    return (
      <div className="bg-white p-6 border-2 border-[#3E2723]" style={{ boxShadow: "8px 8px 0px 0px #8A9A5B" }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold font-['Permanent_Marker'] text-[#3E2723]">Notes</h3>
          <Button variant="primary" disabled>Loading...</Button>
        </div>
        <div className="text-center py-8 text-[#3E2723]/60">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 border-2 border-[#3E2723]" style={{ boxShadow: "8px 8px 0px 0px #8A9A5B" }}>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h3 className="text-xl font-bold font-['Permanent_Marker'] text-[#3E2723]">
          Notes ({notes?.length || 0})
        </h3>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} className="inline mr-1" /> Add Note
        </Button>
      </div>

      {!notes || notes.length === 0 ? (
        <div className="text-center py-8 text-[#3E2723]/60 border-2 border-dashed border-[#3E2723]">
          No notes yet. Click "Add Note" to create one.
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {notes.map((note) => (
            <div
              key={note._id}
              className={`p-4 border-2 border-[#3E2723] transition-all ${
                isReminderDue(note) ? 'bg-red-100 border-red-500' : 'bg-[#F5F5DC]'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-bold text-[#3E2723] flex items-center gap-2">
                  {note.title}
                  {isReminderDue(note) && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 border-2 border-[#3E2723] animate-pulse">
                      DUE
                    </span>
                  )}
                </h4>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(note)}
                    className="p-1.5 border-2 border-[#3E2723] hover:bg-[#8A9A5B] transition"
                    title="Edit note"
                  >
                    <Edit size={14} className="text-[#3E2723]" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this note?')) {
                        onDelete(note._id);
                      }
                    }}
                    className="p-1.5 border-2 border-[#3E2723] hover:bg-red-400 transition"
                    title="Delete note"
                  >
                    <Trash2 size={14} className="text-[#3E2723]" />
                  </button>
                </div>
              </div>
              <p className="text-sm my-2 text-[#3E2723]/80">{note.content}</p>
              <div className="flex justify-between items-center text-xs font-bold text-[#3E2723]/70">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(note.reminderDate)}
                </span>
                <span className="text-[10px]">
                  {note.isReminderActive ? '🔔 Reminder active' : '🔕 No reminder'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Note" size="lg">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={addFormData.title}
            onChange={handleAddChange}
            required
            placeholder="Note title"
          />
          <TextArea
            label="Content"
            name="content"
            value={addFormData.content}
            onChange={handleAddChange}
            required
            rows={4}
            placeholder="Write your note here..."
          />
          <Input
            label="Reminder Date & Time (optional)"
            name="reminderDate"
            type="datetime-local"
            value={addFormData.reminderDate}
            onChange={handleAddChange}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isReminderActive"
              id="addReminderActive"
              checked={addFormData.isReminderActive}
              onChange={handleAddChange}
              className="w-4 h-4 border-2 border-[#3E2723]"
            />
            <label htmlFor="addReminderActive" className="text-sm font-bold text-[#3E2723]">
              Activate reminder
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" disabled={addLoading} className="flex-1 justify-center">
              {addLoading ? 'Saving...' : 'Add Note'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)} className="flex-1 justify-center">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Note Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Note" size="lg">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={editFormData.title}
            onChange={handleEditChange}
            required
            placeholder="Note title"
          />
          <TextArea
            label="Content"
            name="content"
            value={editFormData.content}
            onChange={handleEditChange}
            required
            rows={4}
            placeholder="Write your note here..."
          />
          <Input
            label="Reminder Date & Time (optional)"
            name="reminderDate"
            type="datetime-local"
            value={editFormData.reminderDate}
            onChange={handleEditChange}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isReminderActive"
              id="editReminderActive"
              checked={editFormData.isReminderActive}
              onChange={handleEditChange}
              className="w-4 h-4 border-2 border-[#3E2723]"
            />
            <label htmlFor="editReminderActive" className="text-sm font-bold text-[#3E2723]">
              Activate reminder
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" disabled={editLoading} className="flex-1 justify-center">
              {editLoading ? 'Updating...' : 'Update Note'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)} className="flex-1 justify-center">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NoteList;