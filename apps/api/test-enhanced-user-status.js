const BASE_URL = 'http://localhost:3000';

// Test wallet addresses (replace with real ones for testing)
const TEST_WALLET = '0x1234567890123456789012345678901234567890';
const TEST_REFERRER = '0x0987654321098765432109876543210987654321';
const TEST_LENS_PROFILE = '0xabcdef1234567890abcdef1234567890abcdef';

// Test scenarios
const testScenarios = {
  // Test 1: Get user status for new wallet
  testGetUserStatus: async () => {
    console.log('\n🧪 Test 1: Get User Status for New Wallet');
    try {
      const response = await fetch(`${BASE_URL}/api/premium-registration/status?walletAddress=${TEST_WALLET}`);
      const data = await response.json();
      
      console.log('✅ Response:', data);
      console.log('✅ Expected: userStatus should be "Standard"');
      console.log('✅ Actual:', data.data?.userStatus?.status);
      
      return data.success && data.data?.userStatus?.status === 'Standard';
    } catch (error) {
      console.error('❌ Error:', error);
      return false;
    }
  },

  // Test 2: Check wallet connection status
  testWalletConnectionStatus: async () => {
    console.log('\n🧪 Test 2: Check Wallet Connection Status');
    try {
      const response = await fetch(`${BASE_URL}/api/premium-registration/connection-status?walletAddress=${TEST_WALLET}`);
      const data = await response.json();
      
      console.log('✅ Response:', data);
      console.log('✅ Expected: requiresMetaMaskConnection should be true');
      console.log('✅ Actual:', data.data?.requiresMetaMaskConnection);
      
      return data.success && data.data?.requiresMetaMaskConnection === true;
    } catch (error) {
      console.error('❌ Error:', error);
      return false;
    }
  },

  // Test 3: Test premium registration request (should require MetaMask)
  testPremiumRegistrationRequest: async () => {
    console.log('\n🧪 Test 3: Test Premium Registration Request');
    try {
      const response = await fetch(`${BASE_URL}/api/premium-registration/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: TEST_WALLET,
          referrerAddress: TEST_REFERRER,
          lensProfileId: TEST_LENS_PROFILE
        })
      });
      
      const data = await response.json();
      console.log('✅ Response:', data);
      console.log('✅ Expected: requiresMetaMaskConnection should be true');
      console.log('✅ Actual:', data.requiresMetaMaskConnection);
      
      return !data.success && data.requiresMetaMaskConnection === true;
    } catch (error) {
      console.error('❌ Error:', error);
      return false;
    }
  },

  // Test 4: Test enhanced login endpoint
  testEnhancedLogin: async () => {
    console.log('\n🧪 Test 4: Test Enhanced Login Endpoint');
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login-enhanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: TEST_WALLET,
          lensProfileId: TEST_LENS_PROFILE
        })
      });
      
      const data = await response.json();
      console.log('✅ Response:', data);
      console.log('✅ Expected: userStatus should be "Standard"');
      console.log('✅ Actual:', data.userStatus);
      
      return data.success && data.userStatus === 'Standard';
    } catch (error) {
      console.error('❌ Error:', error);
      return false;
    }
  },

  // Test 5: Test comprehensive user status
  testComprehensiveUserStatus: async () => {
    console.log('\n🧪 Test 5: Test Comprehensive User Status');
    try {
      const response = await fetch(`${BASE_URL}/api/premium-registration/comprehensive-status?walletAddress=${TEST_WALLET}&lensProfileId=${TEST_LENS_PROFILE}`);
      const data = await response.json();
      
      console.log('✅ Response:', data);
      console.log('✅ Expected: userStatus.status should be "Standard"');
      console.log('✅ Actual:', data.data?.userStatus?.status);
      
      return data.success && data.data?.userStatus?.status === 'Standard';
    } catch (error) {
      console.error('❌ Error:', error);
      return false;
    }
  },

  // Test 6: Test premium access check
  testPremiumAccessCheck: async () => {
    console.log('\n🧪 Test 6: Test Premium Access Check');
    try {
      const response = await fetch(`${BASE_URL}/api/auth/premium-access?walletAddress=${TEST_WALLET}`);
      const data = await response.json();
      
      console.log('✅ Response:', data);
      console.log('✅ Expected: canAccess should be false');
      console.log('✅ Actual:', data.data?.canAccess);
      
      return data.success && data.data?.canAccess === false;
    } catch (error) {
      console.error('❌ Error:', error);
      return false;
    }
  },

  // Test 7: Test reward claiming validation
  testRewardClaimingValidation: async () => {
    console.log('\n🧪 Test 7: Test Reward Claiming Validation');
    try {
      const response = await fetch(`${BASE_URL}/api/premium-registration/validate-reward-claiming?walletAddress=${TEST_WALLET}`);
      const data = await response.json();
      
      console.log('✅ Response:', data);
      console.log('✅ Expected: isValid should be false');
      console.log('✅ Actual:', data.data?.isValid);
      
      return data.success && data.data?.isValid === false;
    } catch (error) {
      console.error('❌ Error:', error);
      return false;
    }
  }
};

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Enhanced User Status System Tests...\n');
  
  const results = {};
  let passedTests = 0;
  let totalTests = 0;
  
  for (const [testName, testFn] of Object.entries(testScenarios)) {
    totalTests++;
    console.log(`\n${'='.repeat(60)}`);
    
    try {
      const result = await testFn();
      results[testName] = result;
      
      if (result) {
        passedTests++;
        console.log(`✅ ${testName}: PASSED`);
      } else {
        console.log(`❌ ${testName}: FAILED`);
      }
    } catch (error) {
      results[testName] = false;
      console.log(`❌ ${testName}: ERROR - ${error.message}`);
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 TEST SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  // Detailed results
  console.log('\n📋 DETAILED RESULTS:');
  for (const [testName, result] of Object.entries(results)) {
    console.log(`${result ? '✅' : '❌'} ${testName}: ${result ? 'PASSED' : 'FAILED'}`);
  }
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! The Enhanced User Status System is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.');
  }
  
  return results;
}

// Test specific endpoints
async function testSpecificEndpoint(endpoint, method = 'GET', body = null) {
  console.log(`\n🧪 Testing Endpoint: ${method} ${endpoint}`);
  
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(data, null, 2));
    
    return { success: true, data, status: response.status };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
}

// Export functions for manual testing
module.exports = {
  runAllTests,
  testSpecificEndpoint,
  testScenarios
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
