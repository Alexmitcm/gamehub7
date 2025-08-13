const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = 'http://localhost:3002';
const TEST_WALLET_ADDRESS = '0x1234567890123456789012345678901234567890';
const TEST_PROFILE_ID = '0x01';

// Helper function to make HTTP requests
function makeRequest(method, endpoint, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Test scenarios
async function runTests() {
  console.log('🚀 Starting Premium API Tests...\n');
  
  let testJwt = null;

  try {
    // Step 1: Generate a test JWT
    console.log('📝 Test 0: Generating test JWT...');
    const jwtResponse = await makeRequest('POST', '/test-jwt', {}, {
      walletAddress: TEST_WALLET_ADDRESS,
      profileId: TEST_PROFILE_ID
    });
    
    if (jwtResponse.status === 200 && jwtResponse.data.success) {
      testJwt = jwtResponse.data.data.token;
      console.log('✅ Test JWT generated successfully');
      console.log(`   Token: ${testJwt.substring(0, 50)}...`);
    } else {
      console.log('❌ Failed to generate test JWT');
      console.log(`   Status: ${jwtResponse.status}`);
      console.log(`   Response: ${JSON.stringify(jwtResponse.data, null, 2)}`);
      return;
    }

    // Test Scenario 1: GET /premium/status (Success)
    console.log('\n📋 Test 1: GET /premium/status (Success)');
    const statusResponse = await makeRequest('GET', '/premium/status', {
      'X-Access-Token': testJwt
    });
    
    console.log(`   Status: ${statusResponse.status}`);
    console.log(`   Response: ${JSON.stringify(statusResponse.data, null, 2)}`);
    
    if (statusResponse.status === 200) {
      console.log('✅ Test 1 PASSED');
    } else {
      console.log('❌ Test 1 FAILED');
    }

    // Test Scenario 2: GET /premium/status (Failure - Unauthorized)
    console.log('\n📋 Test 2: GET /premium/status (Failure - Unauthorized)');
    const unauthorizedResponse = await makeRequest('GET', '/premium/status');
    
    console.log(`   Status: ${unauthorizedResponse.status}`);
    console.log(`   Response: ${JSON.stringify(unauthorizedResponse.data, null, 2)}`);
    
    if (unauthorizedResponse.status === 401) {
      console.log('✅ Test 2 PASSED');
    } else {
      console.log('❌ Test 2 FAILED');
    }

    // Test Scenario 3: POST /premium/link-profile (Success)
    console.log('\n📋 Test 3: POST /premium/link-profile (Success)');
    const linkResponse = await makeRequest('POST', '/premium/link-profile', {
      'X-Access-Token': testJwt
    }, {
      profileId: TEST_PROFILE_ID
    });
    
    console.log(`   Status: ${linkResponse.status}`);
    console.log(`   Response: ${JSON.stringify(linkResponse.data, null, 2)}`);
    
    if (linkResponse.status === 201 || linkResponse.status === 200) {
      console.log('✅ Test 3 PASSED');
    } else {
      console.log('❌ Test 3 FAILED');
    }

    // Test Scenario 4: POST /premium/link-profile (Failure - Invalid Input)
    console.log('\n📋 Test 4: POST /premium/link-profile (Failure - Invalid Input)');
    const invalidInputResponse = await makeRequest('POST', '/premium/link-profile', {
      'X-Access-Token': testJwt
    }, {
      profileId: '' // Empty profileId
    });
    
    console.log(`   Status: ${invalidInputResponse.status}`);
    console.log(`   Response: ${JSON.stringify(invalidInputResponse.data, null, 2)}`);
    
    if (invalidInputResponse.status === 400) {
      console.log('✅ Test 4 PASSED');
    } else {
      console.log('❌ Test 4 FAILED');
    }

    // Test Scenario 5: DELETE /premium/unlink-profile (Business Logic Test)
    console.log('\n📋 Test 5: DELETE /premium/unlink-profile (Business Logic Test)');
    const unlinkResponse = await makeRequest('DELETE', '/premium/unlink-profile', {
      'X-Access-Token': testJwt
    });
    
    console.log(`   Status: ${unlinkResponse.status}`);
    console.log(`   Response: ${JSON.stringify(unlinkResponse.data, null, 2)}`);
    
    if (unlinkResponse.status === 200) {
      console.log('✅ Test 5 PASSED');
    } else {
      console.log('❌ Test 5 FAILED');
    }

    // Additional tests
    console.log('\n📋 Test 6: GET /premium/profiles');
    const profilesResponse = await makeRequest('GET', '/premium/profiles', {
      'X-Access-Token': testJwt
    });
    
    console.log(`   Status: ${profilesResponse.status}`);
    console.log(`   Response: ${JSON.stringify(profilesResponse.data, null, 2)}`);
    
    if (profilesResponse.status === 200) {
      console.log('✅ Test 6 PASSED');
    } else {
      console.log('❌ Test 6 FAILED');
    }

    console.log('\n📋 Test 7: GET /premium/wallet-status');
    const walletStatusResponse = await makeRequest('GET', '/premium/wallet-status', {
      'X-Access-Token': testJwt
    });
    
    console.log(`   Status: ${walletStatusResponse.status}`);
    console.log(`   Response: ${JSON.stringify(walletStatusResponse.data, null, 2)}`);
    
    if (walletStatusResponse.status === 200) {
      console.log('✅ Test 7 PASSED');
    } else {
      console.log('❌ Test 7 FAILED');
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

// Run the tests
runTests(); 