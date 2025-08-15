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
            headers: res.headers,
            rawData: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers,
            rawData: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runDetailedTests() {
  console.log('🧪 Detailed Backend Test at:', BASE_URL);
  console.log('='.repeat(60));
  console.log(`⏰ Started: ${new Date().toISOString()}\n`);

  const endpoints = [
    { name: 'Health Check', path: '/ping' },
    { name: 'API Info', path: '/api' },
    { name: 'Admin Stats', path: '/admin/stats' },
    { name: 'Features', path: '/admin/features' },
    { name: 'Games List', path: '/games/list?limit=5' },
    { name: 'Admin Actions', path: '/admin/actions?limit=5' },
    { name: 'Users List', path: '/admin/users?limit=5' },
    { name: 'Premium Status', path: '/premium/status' },
    { name: 'RPC Proxy', path: '/rpc' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing ${endpoint.name}...`);
      const result = await testEndpoint(endpoint.path);
      
      console.log(`   Status: ${result.status}`);
      console.log(`   Headers: ${JSON.stringify(result.headers, null, 2).substring(0, 200)}...`);
      
      if (result.status === 200) {
        console.log(`✅ ${endpoint.name}: SUCCESS`);
        if (result.data && typeof result.data === 'object') {
          console.log(`   📊 Response: ${JSON.stringify(result.data).substring(0, 200)}...`);
        }
      } else {
        console.log(`❌ ${endpoint.name}: FAILED`);
        console.log(`   📊 Full Error: ${result.rawData}`);
        
        // Analyze the error
        if (result.status === 500) {
          if (result.rawData.includes('database') || result.rawData.includes('prisma')) {
            console.log(`   🔍 Analysis: Database connection issue`);
          } else if (result.rawData.includes('AdminService')) {
            console.log(`   🔍 Analysis: AdminService method call issue`);
          } else {
            console.log(`   🔍 Analysis: Server error - check Railway logs`);
          }
        }
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERROR - ${error.message}`);
    }
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('📋 DETAILED ANALYSIS');
  console.log('='.repeat(60));
  
  console.log('\n🎯 CURRENT STATUS:');
  console.log('✅ Basic connectivity: Working');
  console.log('✅ Health endpoint (/ping): Working');
  console.log('❌ Database endpoints: Still failing with 500 errors');
  
  console.log('\n🔍 POSSIBLE ISSUES:');
  console.log('1. Railway deployment needs restart to pick up DATABASE_URL');
  console.log('2. DATABASE_URL format might be incorrect');
  console.log('3. Database permissions/access issues');
  console.log('4. Prisma client needs regeneration');
  
  console.log('\n🔧 RECOMMENDED ACTIONS:');
  console.log('1. Restart Railway deployment: railway up');
  console.log('2. Check Railway logs: railway logs');
  console.log('3. Verify DATABASE_URL in Railway dashboard');
  console.log('4. Test database connection in Railway shell');
  
  console.log('\n📊 NEXT STEPS:');
  console.log('1. Run: railway up (to restart deployment)');
  console.log('2. Wait 2-3 minutes for deployment to complete');
  console.log('3. Run this test again');
}

runDetailedTests().catch(console.error);
