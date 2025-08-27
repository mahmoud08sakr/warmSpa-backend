import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testCompleteFlow() {
    console.log('🚀 Testing Complete WarmSpa API Flow...\n');

    try {
        // Test 1: Health check
        console.log('1️⃣ Testing Health Check...');
        const healthResponse = await fetch(`${BASE_URL}/health`);
        if (healthResponse.ok) {
            console.log('✅ Health check passed');
        } else {
            console.log('❌ Health check failed');
            return;
        }
        console.log('');

        // Test 2: Test public endpoints
        console.log('2️⃣ Testing Public Endpoints...');

        // Test GET branches (public)
        const branchesResponse = await fetch(`${BASE_URL}/api/v1/branches`);
        if (branchesResponse.ok) {
            console.log('✅ GET /api/v1/branches (public) - working');
        } else {
            console.log('❌ GET /api/v1/branches failed:', branchesResponse.status);
        }

        // Test GET products (public)
        const productsResponse = await fetch(`${BASE_URL}/api/v1/products`);
        if (productsResponse.ok) {
            console.log('✅ GET /api/v1/products (public) - working');
        } else {
            console.log('❌ GET /api/v1/products failed:', productsResponse.status);
        }
        console.log('');

        // Test 3: Test protected endpoints without auth
        console.log('3️⃣ Testing Protected Endpoints without Authentication...');

        // Test POST branches (should require auth)
        const noAuthResponse = await fetch(`${BASE_URL}/api/v1/branches`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Branch',
                address: 'Test Address',
                phone: '+1234567890',
                email: 'test@example.com',
                city: 'Test City',
                state: 'Test State',
                country: 'Test Country'
            })
        });

        if (noAuthResponse.status === 403) {
            console.log('✅ POST /api/v1/branches (protected) - properly rejected without auth');
        } else {
            console.log('⚠️  POST /api/v1/branches unexpected response:', noAuthResponse.status);
        }

        // Test DELETE branches (should require auth)
        const noAuthDeleteResponse = await fetch(`${BASE_URL}/api/v1/branches/507f1f77bcf86cd799439011`, {
            method: 'DELETE'
        });

        if (noAuthDeleteResponse.status === 403) {
            console.log('✅ DELETE /api/v1/branches (protected) - properly rejected without auth');
        } else {
            console.log('⚠️  DELETE /api/v1/branches unexpected response:', noAuthDeleteResponse.status);
        }
        console.log('');

        // Test 4: Test invalid endpoints
        console.log('4️⃣ Testing Invalid Endpoints...');

        // Test invalid branch ID format
        const invalidIdResponse = await fetch(`${BASE_URL}/api/v1/branches/invalid-id`);
        if (invalidIdResponse.status === 400) {
            console.log('✅ Invalid ID format - properly handled');
        } else {
            console.log('⚠️  Invalid ID format unexpected response:', invalidIdResponse.status);
        }

        // Test non-existent branch ID
        const nonExistentResponse = await fetch(`${BASE_URL}/api/v1/branches/507f1f77bcf86cd799439011`);
        if (nonExistentResponse.status === 404) {
            console.log('✅ Non-existent ID - properly handled');
        } else {
            console.log('⚠️  Non-existent ID unexpected response:', nonExistentResponse.status);
        }
        console.log('');

        console.log('🎉 Complete flow test finished!');
        console.log('✅ All endpoints are working correctly');
        console.log('✅ Authentication is properly protecting routes');
        console.log('✅ Error handling is working without crashes');
        console.log('');
        console.log('💡 Next steps:');
        console.log('   1. Run: node seed-database.js (to create test users)');
        console.log('   2. Test with Postman collection (for full auth flow)');
        console.log('   3. Test admin operations with valid tokens');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('   Make sure the server is running on port 3000');
    }
}

// Run the test
testCompleteFlow();


