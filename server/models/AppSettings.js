const mongoose = require('mongoose');

const AppSettingsSchema = new mongoose.Schema(
  {
    primaryColor: {
      type: String,
      default: '#d4a843',
      match: [/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'],
    },
    secondaryColor: {
      type: String,
      default: '#b8860b',
      match: [/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'],
    },
    mode: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one document exists
AppSettingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('AppSettings', AppSettingsSchema);