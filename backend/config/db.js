const mongoose = require('mongoose');
const dns = require('dns');

// Set public DNS servers to resolve querySrv ECONNREFUSED issues on local DNS/routers
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  // Ignore error if custom DNS cannot be set
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reflect');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);

    // If Atlas SRV connection fails, try fallback to local MongoDB
    if (process.env.MONGO_URI && process.env.MONGO_URI.includes('mongodb+srv')) {
      console.log('Attempting fallback connection to local MongoDB (mongodb://127.0.0.1:27017/reflect)...');
      try {
        const fallbackConn = await mongoose.connect('mongodb://127.0.0.1:27017/reflect');
        console.log(`MongoDB Connected (Local Fallback): ${fallbackConn.connection.host}`);
        return;
      } catch (fallbackErr) {
        console.error(`Local MongoDB fallback failed: ${fallbackErr.message}`);
      }
    }

    process.exit(1);
  }
};

module.exports = connectDB;

