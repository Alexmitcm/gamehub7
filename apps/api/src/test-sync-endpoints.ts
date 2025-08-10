import { config } from "dotenv";

// Load environment variables
config();

const API_BASE_URL = process.env.HEY_API_URL || "http://localhost:3009";

async function testSyncEndpoints() {
  console.log("🧪 Testing Auth Sync Endpoints");
  console.log("=".repeat(50));

  try {
    // Test 1: Debug token endpoint with invalid token
    console.log("\n1. Testing debug-token with invalid token...");
    const debugResponse = await fetch(`${API_BASE_URL}/auth/debug-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lensAccessToken: "invalid-token" })
    });

    const debugResult = await debugResponse.json();
    console.log("Status:", debugResponse.status);
    console.log("Response:", debugResult);

    // Test 2: Sync-lens endpoint with invalid token
    console.log("\n2. Testing sync-lens with invalid token...");
    const syncResponse = await fetch(`${API_BASE_URL}/auth/sync-lens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lensAccessToken: "invalid-token" })
    });

    const syncResult = await syncResponse.json();
    console.log("Status:", syncResponse.status);
    console.log("Response:", syncResult);

    // Test 3: Debug token endpoint with valid JWT format but invalid signature
    console.log("\n3. Testing debug-token with valid JWT format...");
    const validFormatToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIweDAzQmEzNGY2ZWE0OTk2ZmEzMTY4NzNDRjgzNTBBM2Y3ZWFEMzE3RUYiLCJwcm9maWxlSWQiOiIxOTkyMjQ3ODY0NTI1MTQ2MzQ2NjE4MzQ3ODY5NjIxMzg2MzIzNzcyMTk3NDg1MDc3OTIwOTg1OTkzOTAyNDEwMjQyNzg0Nzc5OTE3MCIsImlhdCI6MTczNTQ5NzI5MCwiZXhwIjoxNzM1NTgzNjkwfQ.test";
    
    const debugResponse2 = await fetch(`${API_BASE_URL}/auth/debug-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lensAccessToken: validFormatToken })
    });

    const debugResult2 = await debugResponse2.json();
    console.log("Status:", debugResponse2.status);
    console.log("Response:", debugResult2);

    // Test 4: Sync-lens endpoint with valid JWT format but invalid signature
    console.log("\n4. Testing sync-lens with valid JWT format...");
    const syncResponse2 = await fetch(`${API_BASE_URL}/auth/sync-lens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lensAccessToken: validFormatToken })
    });

    const syncResult2 = await syncResponse2.json();
    console.log("Status:", syncResponse2.status);
    console.log("Response:", syncResult2);

    console.log("\n✅ All tests completed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testSyncEndpoints(); 