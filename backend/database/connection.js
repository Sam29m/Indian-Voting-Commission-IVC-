const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ivc-db-v2';

  try {
    // Try connecting to external MongoDB first
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.log(`⚠️  External MongoDB not available, starting in-memory server...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`✅ In-memory MongoDB started at ${memUri}`);
      return conn;
    } catch (memError) {
      console.error(`❌ Failed to start MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
