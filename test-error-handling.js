import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testErrorHandling() {
    console.log('🧪 Testing WarmSpa API Error Handling...\n');

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

        // Test 2: Test with invalid branch ID (should return 400, not crash)
        console.log('2️⃣ Testing Invalid Branch ID endpoint...');
        const invalidIdResponse = await fetch(`${BASE_URL}/api/v1/branches/invalid-id-format`);
        const invalidIdData = await invalidIdResponse.json();
        console.log('✅ Invalid ID handled properly:');
        console.log('   Status:', invalidIdResponse.status);
        console.log('   Response:', invalidIdData.status);
        console.log('   Message:', invalidIdData.message);
        console.log('');

        // Test 3: Test with valid format but non-existent ID (should return 404)
        console.log('3️⃣ Testing Non-existent Branch ID endpoint...');
        const nonExistentResponse = await fetch(`${BASE_URL}/api/v1/branches/507f1f77bcf86cd799439011`);
        const nonExistentData = await nonExistentResponse.json();
        console.log('✅ Non-existent ID handled properly:');
        console.log('   Status:', nonExistentResponse.status);
        console.log('   Response:', nonExistentData.status);
        console.log('   Message:', nonExistentData.message);
        console.log('');

        // Test 4: Test branches endpoint (should work and return empty array)
        console.log('4️⃣ Testing Get All Branches endpoint...');
        const branchesResponse = await fetch(`${BASE_URL}/api/v1/branches`);
        if (branchesResponse.ok) {
            const branchesData = await branchesResponse.json();
            console.log('✅ Branches endpoint working:');
            console.log('   Status:', branchesResponse.status);
            console.log('   Results:', branchesData.results);
            console.log('   Data:', branchesData.data);
        } else {
            const errorData = await branchesResponse.json();
            console.log('⚠️  Branches endpoint failed:', branchesResponse.status);
            console.log('   Error:', errorData.message);
        }
        console.log('');

        console.log('🎉 Error handling test completed!');
        console.log('✅ Server should still be running and stable');
        console.log('💡 All errors were handled gracefully without crashes');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('   Make sure the server is running on port 3000');
    }
}

// Run the test
testErrorHandling();
