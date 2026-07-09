const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  let uri = config.mongoUri;
  let options = {};

  const isDefaultUri = uri === 'mongodb://localhost:27017/iqsetters_crm';

  if (isDefaultUri && process.env.NODE_ENV === 'production') {
    console.error('MONGODB_URI not set in production. Set it in Render environment variables.');
    process.exit(1);
  }

  if (isDefaultUri && (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')) {
    console.log('No external MongoDB found. Starting in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    console.log(`In-memory MongoDB started at: ${uri}`);
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
