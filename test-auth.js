import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testAuth() {
    console.log('🔐 Testing WarmSpa API Authentication...\n');

    try {
        // Test 1: Health check (should work)
        console.log('1️⃣ Testing Health Check endpoint...');
        const healthResponse = await fetch(`${BASE_URL}/health`);
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Health endpoint working:', healthData.status);
        } else {
            console.log('⚠️  Health endpoint failed:', healthResponse.status);
        }
        console.log('');

        // Test 2: Test public endpoint (should work without auth)
        console.log('2️⃣ Testing Public Branches endpoint...');
        const publicResponse = await fetch(`${BASE_URL}/api/v1/branches`);
        if (publicResponse.ok) {
            const publicData = await publicResponse.json();
            console.log('✅ Public endpoint working:', publicData.status);
        } else {
            console.log('⚠️  Public endpoint failed:', publicResponse.status);
        }
        console.log('');

        // Test 3: Test protected endpoint without token (should return 403)
        console.log('3️⃣ Testing Protected Endpoint without token...');
        const noTokenResponse = await fetch(`${BASE_URL}/api/v1/branches`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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

        if (noTokenResponse.status === 403) {
            console.log('✅ Protected endpoint properly rejected request without token');
        } else {
            console.log('⚠️  Unexpected response:', noTokenResponse.status);
        }
        console.log('');

        console.log('🎉 Authentication test completed!');
        console.log('💡 To test with valid tokens, use the Postman collection');
        console.log('   or run: node seed-database.js to create test users');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('   Make sure the server is running on port 3000');
    }
}

// Run the test
testAuth();


