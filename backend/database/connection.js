const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ivc-db-v2';

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Failed to connect to MongoDB: ${error.message}`);
    console.error(`   URI: ${uri}`);
    console.error(`   Make sure MongoDB is running or MONGODB_URI is set correctly.`);
    process.exit(1);
  }
};

module.exports = connectDB;
