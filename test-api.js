import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
    console.log('🧪 Testing WarmSpa API endpoints...\n');

    try {
        // Test 1: Health check endpoint
        console.log('1️⃣ Testing Health Check endpoint...');
        const healthResponse = await fetch(`${BASE_URL}/health`);
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Health endpoint:', healthData.status);
            console.log('   Status:', healthResponse.status);
            console.log('   Database:', healthData.database);
            console.log('   Uptime:', Math.round(healthData.uptime), 'seconds');
        } else {
            console.log('⚠️  Health endpoint returned status:', healthResponse.status);
        }
        console.log('');

        // Test 2: Welcome endpoint
        console.log('2️⃣ Testing Welcome endpoint...');
        const welcomeResponse = await fetch(`${BASE_URL}/`);
        if (welcomeResponse.ok) {
            const welcomeData = await welcomeResponse.json();
            console.log('✅ Welcome endpoint:', welcomeData.message);
            console.log('   Status:', welcomeResponse.status);
            console.log('   Version:', welcomeData.version);
        } else {
            console.log('⚠️  Welcome endpoint returned status:', welcomeResponse.status);
        }
        console.log('');

        // Test 3: Get all branches (should return empty array, not error)
        console.log('3️⃣ Testing Get All Branches endpoint...');
        const branchesResponse = await fetch(`${BASE_URL}/api/v1/branches`);
        if (branchesResponse.ok) {
            const branchesData = await branchesResponse.json();
            console.log('✅ Branches endpoint:', branchesData.status);
            console.log('   Status:', branchesResponse.status);
            console.log('   Results:', branchesData.results);
            console.log('   Data:', branchesData.data);
        } else {
            const errorData = await branchesResponse.json();
            console.log('⚠️  Branches endpoint returned status:', branchesResponse.status);
            console.log('   Error:', errorData.message || 'Unknown error');
        }
        console.log('');

        // Test 4: Get all products (should return empty array, not error)
        console.log('4️⃣ Testing Get All Products endpoint...');
        const productsResponse = await fetch(`${BASE_URL}/api/v1/products`);
        if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            console.log('✅ Products endpoint:', productsData.status);
            console.log('   Status:', productsResponse.status);
            console.log('   Results:', productsData.results);
            console.log('   Data:', productsData.data);
        } else {
            const errorData = await productsResponse.json();
            console.log('⚠️  Products endpoint returned status:', productsResponse.status);
            console.log('   Error:', errorData.message || 'Unknown error');
        }
        console.log('');

        // Test 5: Test branches within distance (should handle validation properly)
        console.log('5️⃣ Testing Branches Within Distance endpoint...');
        const distanceResponse = await fetch(`${BASE_URL}/api/v1/branches/within/distance?distance=10&latlng=30.0444,31.2357&unit=mi`);
        if (distanceResponse.ok) {
            const distanceData = await distanceResponse.json();
            console.log('✅ Distance endpoint:', distanceData.status);
            console.log('   Status:', distanceResponse.status);
            console.log('   Results:', distanceData.results);
            console.log('   Data:', distanceData.data);
        } else {
            const errorData = await distanceResponse.json();
            console.log('⚠️  Distance endpoint returned status:', distanceResponse.status);
            console.log('   Error:', errorData.message || 'Unknown error');
        }
        console.log('');

        console.log('🎉 API testing completed!');
        console.log('📝 Note: Empty results are expected since the database is empty.');
        console.log('💡 You can now use the Postman collection to test the full API functionality.');

    } catch (error) {
        console.error('❌ API test failed:', error.message);
        console.error('   Make sure the server is running on port 3000');
        console.error('   Check the server logs for any errors');
    }
}

// Run the test
testAPI();
