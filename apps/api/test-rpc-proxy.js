// Test script for RPC proxy
const API_URL = "http://localhost:8080";

async function testRpcProxy() {
  try {
    // Test health check
    console.log("Testing health check...");
    const healthResponse = await fetch(`${API_URL}/rpc`);
    const healthData = await healthResponse.json();
    console.log("Health check response:", healthData);

    // Test RPC proxy with a simple eth_blockNumber request
    console.log("\nTesting RPC proxy...");
    const rpcResponse = await fetch(`${API_URL}/rpc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1
      }),
    });

    const rpcData = await rpcResponse.json();
    console.log("RPC response:", rpcData);

    if (rpcData.result) {
      console.log("✅ RPC proxy is working correctly!");
    } else {
      console.log("❌ RPC proxy failed:", rpcData);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testRpcProxy();
