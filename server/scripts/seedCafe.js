// server/scripts/seedCafe.js - Seed a default cafe owner and sample menu items
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from the correct path (root of the project)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

const seed = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB.');

    // Read owner credentials from .env or use defaults
    const OWNER_USERNAME = process.env.OWNER_USERNAME || 'admin';
    const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'admin123';
    const CAFE_NAME = process.env.CAFE_NAME || 'My Cafe';
    const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '03001234567';
    const SLUG = CAFE_NAME.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // ------------------------------------------------------------
    // 1. Check if cafe owner already exists
    // ------------------------------------------------------------
    let owner = await User.findOne({ username: OWNER_USERNAME });
    
    if (owner) {
      console.log(`✅ Cafe owner "${owner.username}" already exists. Skipping creation.`);
      console.log(`   Cafe Name: ${owner.cafeName}`);
      console.log(`   Slug: ${owner.slug}`);
    } else {
      console.log(`🔄 Creating cafe owner "${OWNER_USERNAME}"...`);
      
      owner = await User.create({
        username: OWNER_USERNAME,
        password: OWNER_PASSWORD,
        cafeName: CAFE_NAME,
        slug: SLUG,
        whatsappNumber: WHATSAPP_NUMBER,
        tables: ['1', '2', '3', '4', '5'],
        logoUrl: '',
        faviconUrl: '',
        theme: {
          primaryColor: '#d4a843',
          secondaryColor: '#b8860b',
          mode: 'light',
        },
      });
      
      console.log(`✅ Cafe owner created successfully:`);
      console.log(`   Username: ${owner.username}`);
      console.log(`   Cafe Name: ${owner.cafeName}`);
      console.log(`   Slug: ${owner.slug}`);
      console.log(`   WhatsApp: ${owner.whatsappNumber}`);
    }

    // ------------------------------------------------------------
    // 2. Check if menu items already exist for this owner
    // ------------------------------------------------------------
    const existingItems = await MenuItem.find({ ownerId: owner._id });
    
    if (existingItems.length > 0) {
      console.log(`✅ ${existingItems.length} menu items already exist. Skipping menu seed.`);
    } else {
      console.log('🔄 Adding sample menu items...');

      const sampleItems = [
        {
          ownerId: owner._id,
          title: 'Zinger Burger',
          description: 'Crispy chicken fillet with spicy sauce, lettuce, and cheese in a toasted bun.',
          price: 550,
          category: 'Burgers',
          imageUrl: 'https://via.placeholder.com/400x400/8A9A5B/FFFFFF?text=Zinger+Burger',
          isAvailable: true,
        },
        {
          ownerId: owner._id,
          title: 'Classic Cheeseburger',
          description: 'Beef patty with melted cheddar, lettuce, tomato, and special sauce.',
          price: 450,
          category: 'Burgers',
          imageUrl: 'https://via.placeholder.com/400x400/8A9A5B/FFFFFF?text=Cheeseburger',
          isAvailable: true,
        },
        {
          ownerId: owner._id,
          title: 'Iced Tea',
          description: 'Fresh brewed iced tea with a hint of lemon and mint.',
          price: 200,
          category: 'Drinks',
          imageUrl: 'https://via.placeholder.com/400x400/8A9A5B/FFFFFF?text=Iced+Tea',
          isAvailable: true,
        },
        {
          ownerId: owner._id,
          title: 'Fresh Lime Soda',
          description: 'Refreshing lime soda with a splash of mint.',
          price: 250,
          category: 'Drinks',
          imageUrl: 'https://via.placeholder.com/400x400/8A9A5B/FFFFFF?text=Lime+Soda',
          isAvailable: true,
        },
        {
          ownerId: owner._id,
          title: 'French Fries',
          description: 'Golden crispy fries served with ketchup and special seasoning.',
          price: 300,
          category: 'Sides',
          imageUrl: 'https://via.placeholder.com/400x400/8A9A5B/FFFFFF?text=French+Fries',
          isAvailable: true,
        },
        {
          ownerId: owner._id,
          title: 'Chicken Nuggets',
          description: 'Crispy breaded chicken nuggets with your choice of dipping sauce.',
          price: 350,
          category: 'Sides',
          imageUrl: 'https://via.placeholder.com/400x400/8A9A5B/FFFFFF?text=Nuggets',
          isAvailable: true,
        },
        {
          ownerId: owner._id,
          title: 'Chocolate Brownie',
          description: 'Rich, fudgy chocolate brownie topped with chocolate sauce.',
          price: 280,
          category: 'Desserts',
          imageUrl: 'https://via.placeholder.com/400x400/8A9A5B/FFFFFF?text=Brownie',
          isAvailable: true,
        },
        {
          ownerId: owner._id,
          title: 'Vanilla Ice Cream',
          description: 'Creamy vanilla ice cream served with chocolate syrup.',
          price: 220,
          category: 'Desserts',
          imageUrl: 'https://via.placeholder.com/400x400/8A9A5B/FFFFFF?text=Ice+Cream',
          isAvailable: true,
        },
      ];

      await MenuItem.insertMany(sampleItems);
      console.log(`✅ ${sampleItems.length} sample menu items added successfully.`);
    }

    // ------------------------------------------------------------
    // 3. Summary
    // ------------------------------------------------------------
    console.log('');
    console.log('🎉 Seeding complete!');
    console.log('───────────────────────────');
    console.log(`🔑 Login Credentials:`);
    console.log(`   Username: ${OWNER_USERNAME}`);
    console.log(`   Password: ${OWNER_PASSWORD}`);
    console.log('');
    console.log(`☕ Cafe: ${owner.cafeName}`);
    console.log(`🔗 Public Menu: http://localhost:${process.env.PORT || 5000}/menu/${owner.slug}`);
    console.log(`📱 WhatsApp: ${owner.whatsappNumber}`);
    console.log('');
    console.log('📝 You can change these settings in your .env file.');
    console.log('───────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
};

seed();