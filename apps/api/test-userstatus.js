// Test UserStatusService directly
const UserStatusService = require('./src/services/UserStatusService').default;

async function testUserStatus() {
  try {
    console.log('Testing UserStatusService...');
    
    const service = new UserStatusService();
    const testWallet = '0x1234567890123456789012345678901234567890';
    const testLensProfile = '0xabcdef1234567890abcdef1234567890abcdef';
    
    console.log('Testing getUserStatus...');
    const userStatus = await service.getUserStatus(testWallet, testLensProfile);
    console.log('✅ getUserStatus successful:', userStatus);
    
    console.log('Testing canLinkProfile...');
    const canLink = await service.canLinkProfile(testWallet, testLensProfile);
    console.log('✅ canLinkProfile successful:', canLink);
    
    console.log('Testing handleUserLogin...');
    const loginResult = await service.handleUserLogin(testWallet, testLensProfile);
    console.log('✅ handleUserLogin successful:', loginResult);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testUserStatus();
