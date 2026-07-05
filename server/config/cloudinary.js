// config/cloudinary.js - Cloudinary SDK configuration
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// ✅ Validate required environment variables
const requiredCloudinaryVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];
const missingVars = requiredCloudinaryVars.filter(key => !process.env[key]);

if (missingVars.length > 0) {
  const errorMsg = `❌ Missing Cloudinary environment variables: ${missingVars.join(', ')}. Please set them in your .env file.`;
  console.error(errorMsg);
  // Throw an error to prevent the app from starting with incomplete config
  throw new Error(errorMsg);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('✅ Cloudinary configured successfully.');

module.exports = cloudinary;