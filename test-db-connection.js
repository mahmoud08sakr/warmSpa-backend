import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
    try {
        console.log('🔌 Testing database connection...');
        console.log('📡 MongoDB URI:', process.env.MONGO_URI || 'Not set');

        // Test connection
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Database connected successfully!');
        console.log('📊 Connection state:', mongoose.connection.readyState);
        console.log('🏠 Database name:', conn.connection.name);

        // Test a simple query
        const collections = await conn.connection.db.listCollections().toArray();
        console.log('📚 Available collections:', collections.map(c => c.name));

        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('💡 Make sure:');
        console.error('   1. MongoDB is running');
        console.error('   2. MONGO_URI is set in .env file');
        console.error('   3. Network allows connection to MongoDB');
    }
};

testConnection();


