// Test script for your premium wallet
const testYourWallet = async () => {
  // Replace with your actual premium wallet address
  const yourWallet = "0x70c7...E11D"; // Replace with your full wallet address
  const yourProfileId = "your-lens-profile-id"; // Replace with your Lens profile ID

  try {
    console.log("🧪 Testing your premium wallet...");
    console.log("Wallet:", yourWallet);
    console.log("Profile:", yourProfileId);

    // Test simple status endpoint
    const response = await fetch(
      "http://localhost:3003/api/premium/simple-status",
      {
        body: JSON.stringify({
          profileId: yourProfileId,
          walletAddress: yourWallet
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      }
    );

    const data = await response.json();
    console.log("✅ API Response:", JSON.stringify(data, null, 2));

    if (data.status === "Success") {
      console.log("✅ API is working!");
      console.log("📊 User Status:", data.data.userStatus);
      if (data.data.linkedProfile) {
        console.log("🔗 Linked Profile:", data.data.linkedProfile);
      }
    } else {
      console.log("❌ API returned error:", data);
    }
  } catch (error) {
    console.error("❌ API test failed:", error.message);
    console.log("Make sure the backend is running on port 3003");
  }
};

// Run the test
testYourWallet();
