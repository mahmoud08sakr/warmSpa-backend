import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Branch from './src/database/model/branch.model.js';
import Product from './src/database/model/product.model.js';
import User from './src/database/model/user.model.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/warmspa';

async function seedDatabase() {
    try {
        console.log('🌱 Seeding database...');

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Branch.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});
        console.log('🧹 Cleared existing data');

        // Create test user (Admin)
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@warmspa.com',
            password: hashedPassword,
            phone: '+1234567890',
            role: 'Admin'
        });
        console.log('👤 Created admin user:', adminUser.email);

        // Create test user (Regular User)
        const userPassword = await bcrypt.hash('user123', 10);
        const regularUser = await User.create({
            name: 'John Doe',
            email: 'john@warmspa.com',
            password: userPassword,
            phone: '+1234567891',
            role: 'User'
        });
        console.log('👤 Created regular user:', regularUser.email);

        // Create test branch
        const testBranch = await Branch.create({
            name: 'Downtown Spa',
            address: '123 Main Street, Downtown',
            phone: '+1234567890',
            email: 'downtown@warmspa.com',
            city: 'Cairo',
            state: 'Cairo',
            country: 'Egypt',
            location: {
                type: 'Point',
                coordinates: [31.2357, 30.0444]
            },
            workingHours: {
                monday: '9:00 AM - 6:00 PM',
                tuesday: '9:00 AM - 6:00 PM',
                wednesday: '9:00 AM - 6:00 PM',
                thursday: '9:00 AM - 6:00 PM',
                friday: '9:00 AM - 6:00 PM',
                saturday: '10:00 AM - 4:00 PM',
                sunday: 'Closed'
            },
            services: ['Massage', 'Facial', 'Body Treatment'],
            description: 'Premium spa services in the heart of downtown'
        });
        console.log('🏢 Created test branch:', testBranch.name);

        // Create test products
        const testProducts = await Product.create([
            {
                name: 'Swedish Massage',
                description: 'Relaxing full body massage using long strokes and kneading techniques',
                price: 120,
                duration: 60,
                category: 'Massage',
                branch: testBranch._id,
                features: ['Relaxation', 'Stress Relief', 'Muscle Tension'],
                benefits: ['Reduces stress', 'Improves circulation', 'Relieves muscle tension'],
                images: ['https://example.com/swedish-massage.jpg']
            },
            {
                name: 'Deep Tissue Massage',
                description: 'Intensive massage targeting deep muscle layers and connective tissue',
                price: 150,
                duration: 75,
                category: 'Massage',
                branch: testBranch._id,
                features: ['Deep Pressure', 'Muscle Recovery', 'Pain Relief'],
                benefits: ['Breaks down scar tissue', 'Improves mobility', 'Reduces chronic pain'],
                images: ['https://example.com/deep-tissue-massage.jpg']
            },
            {
                name: 'Facial Treatment',
                description: 'Rejuvenating facial with cleansing, exfoliation, and hydration',
                price: 80,
                duration: 45,
                category: 'Facial',
                branch: testBranch._id,
                features: ['Cleansing', 'Exfoliation', 'Hydration'],
                benefits: ['Improves skin texture', 'Reduces fine lines', 'Brightens complexion'],
                images: ['https://example.com/facial-treatment.jpg']
            }
        ]);
        console.log('🛍️ Created test products:', testProducts.length);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Test Data Summary:');
        console.log(`   👤 Users: ${await User.countDocuments()}`);
        console.log(`   🏢 Branches: ${await Branch.countDocuments()}`);
        console.log(`   🛍️ Products: ${await Product.countDocuments()}`);
        console.log('\n🔑 Test Credentials:');
        console.log('   Admin: admin@warmspa.com / admin123');
        console.log('   User: john@warmspa.com / user123');
        console.log('\n💡 You can now test the API with real data!');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the seed function
seedDatabase();
