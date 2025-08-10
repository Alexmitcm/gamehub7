// Simple test script to verify premium API
const testPremiumAPI = async () => {
  const testWallet = "0x1234567890123456789012345678901234567890";
  const testProfileId = "test-profile-123";

  try {
    console.log("🧪 Testing Premium API...");

    // Test simple status endpoint
    const response = await fetch(
      "http://localhost:3003/api/premium/simple-status",
      {
        body: JSON.stringify({
          profileId: testProfileId,
          walletAddress: testWallet
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      }
    );

    const data = await response.json();
    console.log("✅ API Response:", data);

    if (data.status === "Success") {
      console.log("✅ API is working correctly!");
      console.log("📊 User Status:", data.data.userStatus);
      if (data.data.linkedProfile) {
        console.log("🔗 Linked Profile:", data.data.linkedProfile);
      }
    } else {
      console.log("❌ API returned error:", data);
    }
  } catch (error) {
    console.error("❌ API test failed:", error.message);
  }
};

// Run the test
testPremiumAPI();
