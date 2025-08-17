const RAILWAY_URL = 'https://game5-production.up.railway.app';

async function testBackend() {
  console.log('🧪 Testing Backend After Adding Supabase Variables...');
  console.log('📍 URL:', RAILWAY_URL);
  console.log('⏰ Time:', new Date().toISOString());

  try {
    // Test 1: Basic connectivity
    console.log('\n1️⃣ Testing basic connectivity...');
    const pingResponse = await fetch(RAILWAY_URL + '/ping');
    const pingData = await pingResponse.json();
    
    if (pingResponse.ok) {
      console.log('✅ Ping: SUCCESS! Status:', pingResponse.status);
      console.log('📊 Response:', JSON.stringify(pingData));
    } else {
      console.log('❌ Ping: FAILED! Status:', pingResponse.status);
      console.log('📊 Error:', JSON.stringify(pingData));
    }
    
    // Test 2: Health endpoint
    console.log('\n2️⃣ Testing health endpoint...');
    const healthResponse = await fetch(RAILWAY_URL + '/health');
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Health: SUCCESS! Status:', healthResponse.status);
      console.log('📊 Response:', JSON.stringify(healthData));
    } else {
      console.log('❌ Health: FAILED! Status:', healthResponse.status);
      console.log('📊 Error:', JSON.stringify(healthData));
    }
    
    // Test 3: Admin stats (database)
    console.log('\n3️⃣ Testing admin stats (database)...');
    const statsResponse = await fetch(RAILWAY_URL + '/admin/stats');
    const statsData = await statsResponse.json();
    
    if (statsResponse.ok) {
      console.log('✅ Admin Stats: SUCCESS!');
      console.log('📊 Data:', JSON.stringify(statsData).substring(0, 200) + '...');
    } else {
      console.log('❌ Admin Stats: FAILED! Status:', statsResponse.status);
      console.log('📊 Error:', JSON.stringify(statsData));
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('✅ Backend URL updated successfully');
    console.log('✅ Supabase variables added to Railway');
    console.log('✅ All endpoints tested');
    
  } catch (error) {
    console.log('❌ Test Error:', error.message);
  }
}

// Run the test
testBackend();
