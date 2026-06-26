const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    cafeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 100,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: 2000,
    },
    reminderDate: {
      type: Date,
      default: null,
    },
    isReminderActive: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

NoteSchema.index({ cafeId: 1, reminderDate: 1 });
NoteSchema.index({ cafeId: 1, isReminderActive: 1 });

module.exports = mongoose.model('Note', NoteSchema);