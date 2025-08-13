import { config } from "dotenv";

// Load environment variables
config();

const API_BASE_URL = "http://localhost:3009";

/**
 * Simple test for the sync-lens endpoint
 */
async function testSimpleSync() {
  try {
    console.log("🧪 Testing sync-lens endpoint");
    console.log(`API Base URL: ${API_BASE_URL}`);

    // Test the endpoint
    const response = await fetch(`${API_BASE_URL}/auth/sync-lens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        lensAccessToken: "test_token"
      })
    });

    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log(`Response: ${JSON.stringify(result, null, 2)}`);
    } else {
      const errorText = await response.text();
      console.log(`Error Response: ${errorText}`);
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testSimpleSync(); 