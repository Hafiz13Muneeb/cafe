const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    // Common fields for all users (superadmin and owners)
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['superadmin', 'owner'],
      default: 'owner',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },

    // Cafe owner specific fields (only used when role === 'owner')
    cafeName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true, // allows multiple nulls (superadmins don't have a slug)
      trim: true,
      lowercase: true,
    },
    whatsappNumber: {
      type: String,
      match: [/^[0-9]{10,15}$/, 'WhatsApp number must be 10-15 digits, no special chars'],
    },
    logoUrl: {
      type: String,
      default: '',
    },
    faviconUrl: {
      type: String,
      default: '',
    },
    tables: {
      type: [String],
      default: ['1', '2', '3', '4', '5'],
    },

    // Theme settings for the public menu
    theme: {
      primaryColor: {
        type: String,
        default: '#d4a843',
      },
      secondaryColor: {
        type: String,
        default: '#b8860b',
      },
      mode: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
    },
  },
  {
    timestamps: true,
  }
);

// ------------------------------------------------
// Indexes for performance
// ------------------------------------------------
UserSchema.index({ slug: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ role: 1, isBlocked: 1 });

// ------------------------------------------------
// Pre-save: hash password and auto-generate slug
// ------------------------------------------------
UserSchema.pre('save', async function (next) {
  // Hash password if modified
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  // Auto-generate slug from cafeName for owners if not provided
  if (this.role === 'owner' && this.isModified('cafeName') && !this.slug) {
    const baseSlug = this.cafeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    // Ensure uniqueness by appending a short random string if conflict occurs
    // We'll handle uniqueness in a separate step, but we set a base.
    this.slug = baseSlug;
  }

  next();
});

// Ensure slug uniqueness with a retry mechanism (optional, but we can handle in controller)
// Alternatively, we can add a post-save hook to handle duplicates, but we'll rely on the unique index
// and catch the error in the service layer.

// ------------------------------------------------
// Method to compare entered password with hashed
// ------------------------------------------------
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ------------------------------------------------
// Virtual: check if user is a superadmin
// ------------------------------------------------
UserSchema.virtual('isSuperAdmin').get(function () {
  return this.role === 'superadmin';
});

// Ensure virtuals are included in JSON output
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);