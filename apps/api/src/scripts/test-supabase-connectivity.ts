import * as https from "node:https";

async function testSupabaseConnectivity() {
  const urls = [
    "https://supabase.com",
    "https://zdlmkqxqqkjmlgmqierg.supabase.co",
    "https://db.hyzardurrtfrglfuelyd.supabase.co"
  ];

  console.log("🔍 Testing Supabase connectivity...\n");

  for (const url of urls) {
    try {
      console.log(`📡 Testing: ${url}`);

      const _result = await new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
          console.log(`   ✅ Status: ${res.statusCode}`);
          console.log(
            `   ✅ Headers: ${Object.keys(res.headers).length} headers`
          );
          resolve(true);
        });

        req.setTimeout(10000, () => {
          console.log("   ❌ Timeout after 10 seconds");
          reject(new Error("Timeout"));
        });

        req.on("error", (error) => {
          console.log(`   ❌ Error: ${error.message}`);
          reject(error);
        });
      });
    } catch (_error) {
      console.log("   ❌ Failed to connect");
    }
    console.log("");
  }

  console.log("🔧 **DIAGNOSIS:**");
  console.log("   If Supabase.com works but the database URLs don't:");
  console.log("   - Your network can reach Supabase");
  console.log("   - But database connections are blocked");
  console.log("");
  console.log("   If nothing works:");
  console.log("   - Complete network isolation");
  console.log("   - Firewall/ISP blocking all Supabase traffic");
}

testSupabaseConnectivity()
  .then(() => {
    console.log("✅ Connectivity tests completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Tests failed:", error);
    process.exit(1);
  });
