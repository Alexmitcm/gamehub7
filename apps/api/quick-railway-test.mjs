import fetch from "node-fetch";

const RAILWAY_URL = "https://gamehub4-production.up.railway.app";

async function quickRailwayTest() {
  console.log("🚀 Quick Railway Connection Test");
  console.log("=" .repeat(40));
  console.log(`📍 Testing: ${RAILWAY_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}\n`);

  try {
    // Test basic connectivity
    console.log("🔍 Testing basic connectivity...");
    const startTime = Date.now();
    
    const response = await fetch(`${RAILWAY_URL}/ping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Quick-Railway-Test/1.0'
      },
      timeout: 5000
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json().catch(() => ({ error: "Invalid JSON" }));

    if (response.ok) {
      console.log(`✅ SUCCESS! (${response.status}) - ${responseTime}ms`);
      console.log(`📊 Response: ${JSON.stringify(data)}`);
      console.log("\n🎉 Your Railway backend is accessible!");
      console.log("\n📋 Next Steps:");
      console.log("1. Run the full test: node test-railway-connection.js");
      console.log("2. Check Railway dashboard for deployment status");
      console.log("3. Verify environment variables are set");
    } else {
      console.log(`❌ FAILED (${response.status}) - ${response.statusText}`);
      console.log(`📊 Error: ${JSON.stringify(data)}`);
      console.log("\n🔧 Troubleshooting:");
      console.log("1. Check if Railway deployment is running");
      console.log("2. Verify the URL is correct");
      console.log("3. Check Railway logs for errors");
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check your internet connection");
    console.log("2. Verify the Railway URL is correct");
    console.log("3. Check if Railway deployment is running");
    console.log("4. Try running: node test-railway-connection.js");
  }
}

quickRailwayTest().catch(error => {
  console.error("❌ Quick test failed:", error);
  process.exit(1);
});
