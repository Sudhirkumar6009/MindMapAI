import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('\n========== MongoDB Connection ==========');
    console.log('Attempting to connect to:', process.env.MONGODB_URI);
    
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('   Host:', conn.connection.host);
    console.log('   Database:', conn.connection.name);
    console.log('   Port:', conn.connection.port);
    console.log('=========================================\n');
    
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (error) {
    console.log('\n========== MongoDB Connection ==========');
    console.error('❌ MongoDB Connection FAILED!');
    console.error('   Error:', error.message);
    console.log('=========================================\n');
    process.exit(1);
  }
};

export default connectDB;
