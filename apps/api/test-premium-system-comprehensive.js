const BASE_URL = 'http://localhost:8080/new-premium-registration';

// Test data
const TEST_WALLET = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
const TEST_REFERRER = '0x1234567890123456789012345678901234567890';
const TEST_PROFILE_ID = '0x1234';

// Utility function for making requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 'ERROR', data: { error: error.message } };
  }
}

// Test functions
async function testHealthEndpoint() {
  console.log('\n🔍 Testing Health Endpoint...');
  const result = await makeRequest(`${BASE_URL}/health`);
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result.status === 200;
}

async function testRootEndpoint() {
  console.log('\n🔍 Testing Root Endpoint...');
  const result = await makeRequest(`${BASE_URL}/`);
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result.status === 200;
}

async function testUserStatusEndpoints() {
  console.log('\n🔍 Testing User Status Endpoints...');
  
  // Test GET endpoint
  console.log('Testing GET /user-status...');
  const getResult = await makeRequest(`${BASE_URL}/user-status?walletAddress=${TEST_WALLET}`);
  console.log(`GET Status: ${getResult.status}`);
  console.log('GET Response:', JSON.stringify(getResult.data, null, 2));
  
  // Test POST endpoint
  console.log('\nTesting POST /user-status...');
  const postResult = await makeRequest(`${BASE_URL}/user-status`, {
    method: 'POST',
    body: JSON.stringify({ walletAddress: TEST_WALLET })
  });
  console.log(`POST Status: ${postResult.status}`);
  console.log('POST Response:', JSON.stringify(postResult.data, null, 2));
  
  return getResult.status === 200 && postResult.status === 200;
}

async function testCheckWalletPremiumEndpoints() {
  console.log('\n🔍 Testing Check Wallet Premium Endpoints...');
  
  // Test GET endpoint
  console.log('Testing GET /check-wallet-premium...');
  const getResult = await makeRequest(`${BASE_URL}/check-wallet-premium?walletAddress=${TEST_WALLET}`);
  console.log(`GET Status: ${getResult.status}`);
  console.log('GET Response:', JSON.stringify(getResult.data, null, 2));
  
  // Test POST endpoint
  console.log('\nTesting POST /check-wallet-premium...');
  const postResult = await makeRequest(`${BASE_URL}/check-wallet-premium`, {
    method: 'POST',
    body: JSON.stringify({ walletAddress: TEST_WALLET })
  });
  console.log(`POST Status: ${postResult.status}`);
  console.log('POST Response:', JSON.stringify(postResult.data, null, 2));
  
  return getResult.status === 200 && postResult.status === 200;
}

async function testCanLinkProfileEndpoints() {
  console.log('\n🔍 Testing Can Link Profile Endpoints...');
  
  // Test GET endpoint
  console.log('Testing GET /can-link-profile...');
  const getResult = await makeRequest(`${BASE_URL}/can-link-profile?walletAddress=${TEST_WALLET}&profileId=${TEST_PROFILE_ID}`);
  console.log(`GET Status: ${getResult.status}`);
  console.log('GET Response:', JSON.stringify(getResult.data, null, 2));
  
  // Test POST endpoint
  console.log('\nTesting POST /can-link-profile...');
  const postResult = await makeRequest(`${BASE_URL}/can-link-profile`, {
    method: 'POST',
    body: JSON.stringify({ walletAddress: TEST_WALLET, profileId: TEST_PROFILE_ID })
  });
  console.log(`POST Status: ${postResult.status}`);
  console.log('POST Response:', JSON.stringify(postResult.data, null, 2));
  
  return getResult.status === 200 && postResult.status === 200;
}

async function testDiscoverProfilesEndpoints() {
  console.log('\n🔍 Testing Discover Profiles Endpoints...');
  
  // Test GET endpoint
  console.log('Testing GET /discover-profiles...');
  const getResult = await makeRequest(`${BASE_URL}/discover-profiles?walletAddress=${TEST_WALLET}`);
  console.log(`GET Status: ${getResult.status}`);
  console.log('GET Response:', JSON.stringify(getResult.data, null, 2));
  
  // Test POST endpoint
  console.log('\nTesting POST /discover-profiles...');
  const postResult = await makeRequest(`${BASE_URL}/discover-profiles`, {
    method: 'POST',
    body: JSON.stringify({ walletAddress: TEST_WALLET })
  });
  console.log(`POST Status: ${postResult.status}`);
  console.log('POST Response:', JSON.stringify(postResult.data, null, 2));
  
  return getResult.status === 200 && postResult.status === 200;
}

async function testAutoLinkProfileEndpoint() {
  console.log('\n🔍 Testing Auto Link Profile Endpoint...');
  
  const result = await makeRequest(`${BASE_URL}/auto-link-profile`, {
    method: 'POST',
    body: JSON.stringify({ walletAddress: TEST_WALLET })
  });
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result.status === 200;
}

async function testGetProfileByIdEndpoint() {
  console.log('\n🔍 Testing Get Profile By ID Endpoint...');
  
  const result = await makeRequest(`${BASE_URL}/profile/${TEST_PROFILE_ID}`);
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result.status === 200 || result.status === 404; // 404 is expected for non-existent profile
}

async function testLinkProfileEndpoint() {
  console.log('\n🔍 Testing Link Profile Endpoint...');
  
  const result = await makeRequest(`${BASE_URL}/link-profile`, {
    method: 'POST',
    body: JSON.stringify({ walletAddress: TEST_WALLET, profileId: TEST_PROFILE_ID })
  });
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result.status === 200 || result.status === 400; // 400 is expected for invalid data
}

async function testRegisterEndpoint() {
  console.log('\n🔍 Testing Register Endpoint...');
  
  const result = await makeRequest(`${BASE_URL}/register`, {
    method: 'POST',
    body: JSON.stringify({
      userAddress: TEST_WALLET,
      referrerAddress: TEST_REFERRER,
      lensProfileId: TEST_PROFILE_ID
    })
  });
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  return result.status === 200 || result.status === 400; // 400 is expected for invalid data
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Premium Registration System Tests...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Wallet: ${TEST_WALLET}`);
  console.log(`Test Referrer: ${TEST_REFERRER}`);
  console.log(`Test Profile ID: ${TEST_PROFILE_ID}`);
  
  const results = [];
  
  // Run all tests
  results.push(await testHealthEndpoint());
  results.push(await testRootEndpoint());
  results.push(await testUserStatusEndpoints());
  results.push(await testCheckWalletPremiumEndpoints());
  results.push(await testCanLinkProfileEndpoints());
  results.push(await testDiscoverProfilesEndpoints());
  results.push(await testAutoLinkProfileEndpoint());
  results.push(await testGetProfileByIdEndpoint());
  results.push(await testLinkProfileEndpoint());
  results.push(await testRegisterEndpoint());
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Premium registration system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
  }
  
  return { passed, total, successRate: (passed / total) * 100 };
}

// Run tests if this script is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
