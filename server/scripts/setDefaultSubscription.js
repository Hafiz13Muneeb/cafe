// scripts/setDefaultSubscription.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');

const migrate = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB.');

    const result = await User.updateMany(
      { 'subscription.plan': { $exists: false } },
      {
        $set: {
          'subscription.plan': 'free',
          'subscription.status': 'active',
          'subscription.lemonSqueezyId': null,
          'subscription.variantId': null,
          'subscription.currentPeriodEnd': null,
          'subscription.cancelAtPeriodEnd': false,
          'subscription.trialEndsAt': null,
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with default subscription.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
};

migrate();