const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  let uri = config.mongoUri;
  let options = {};

  if (uri === 'mongodb://localhost:27017/iqsetters_crm') {
    console.log('MONGODB_URI not set. Set it in .env to connect to MongoDB Atlas.');
    console.log('For local dev, run: cd server && npm install mongodb-memory-server');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
