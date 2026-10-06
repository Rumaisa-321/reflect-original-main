require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Fix for querySrv ECONNREFUSED on networks/routers (e.g. JioFiber) that fail to resolve SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (err) {
  // Ignore if unable to set servers in certain environments
}

const connectDB = async (retries = 3, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const uri = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reflect').trim();
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`Database connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) {
        process.exit(1);
      }
      console.log(`Retrying connection in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;
