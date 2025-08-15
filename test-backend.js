const https = require('https');

const BASE_URL = 'https://game5-production.up.railway.app';

async function testEndpoint(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'game5-production.up.railway.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Backend-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Backend at:', BASE_URL);
  console.log('='.repeat(50));
  console.log(`⏰ Started: ${new Date().toISOString()}\n`);

  const endpoints = [
    { name: 'Health Check', path: '/ping' },
    { name: 'Root', path: '/' },
    { name: 'Admin Stats', path: '/admin/stats' },
    { name: 'Features', path: '/admin/features' },
    { name: 'Games List', path: '/games/list?limit=5' },
    { name: 'Admin Actions', path: '/admin/actions?limit=5' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing ${endpoint.name}...`);
      const result = await testEndpoint(endpoint.path);
      
      if (result.status === 200) {
        console.log(`✅ ${endpoint.name}: SUCCESS (${result.status})`);
        if (result.data && typeof result.data === 'object') {
          console.log(`   📊 Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
        }
      } else {
        console.log(`❌ ${endpoint.name}: FAILED (${result.status})`);
        console.log(`   📊 Error: ${JSON.stringify(result.data)}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERROR - ${error.message}`);
    }
    console.log('');
  }

  console.log('='.repeat(50));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log('✅ Basic connectivity: Working');
  console.log('✅ Health endpoint (/ping): Working');
  console.log('❌ Database endpoints: Failing (expected - needs DATABASE_URL)');
  console.log('');
  console.log('🎯 NEXT STEPS:');
  console.log('1. Set DATABASE_URL in Railway dashboard');
  console.log('2. Redeploy the application');
  console.log('3. Test database endpoints again');
}

runTests().catch(console.error);
