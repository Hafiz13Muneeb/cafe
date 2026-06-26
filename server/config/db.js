const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  while (retries) {
    try {
      const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL;
      if (!uri) {
        throw new Error("MongoDB connection string is missing!");
      }

      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 60000, // 60 seconds
        socketTimeoutMS: 60000,
        retryWrites: true,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`❌ Connection attempt failed (${retries} left):`, error.message);
      retries--;
      if (retries === 0) {
        console.error('❌ All retries failed. Exiting.');
        process.exit(1);
      }
      // Wait 5 seconds before next attempt
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

module.exports = connectDB;