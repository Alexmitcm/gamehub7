import fetch from "node-fetch";

const RAILWAY_URL = "https://gamehub4-production.up.railway.app";

// Test configuration
const TEST_CONFIG = {
  endpoints: [
    { auth: false, method: "GET", name: "Health Check", path: "/ping" },
    { auth: false, method: "GET", name: "Admin Stats", path: "/admin/stats" },
    { auth: false, method: "GET", name: "Features", path: "/admin/features" },
    {
      auth: false,
      method: "GET",
      name: "Admin Actions",
      path: "/admin/actions?limit=5"
    },
    { auth: false, method: "GET", name: "Auth Status", path: "/auth/status" },
    {
      auth: false,
      method: "GET",
      name: "Games List",
      path: "/games/list?limit=5"
    },
    {
      auth: false,
      method: "GET",
      name: "Live Streams",
      path: "/live/list?limit=5"
    },
    { auth: false, method: "GET", name: "Sitemap", path: "/sitemap" },
    {
      auth: false,
      method: "GET",
      name: "OG Account",
      path: "/og/account?handle=test"
    },
    {
      auth: false,
      method: "GET",
      name: "OEmbed",
      path: "/oembed?url=https://example.com"
    }
  ],
  retries: 3,
  timeout: 10000 // 10 seconds timeout
};

class RailwayConnectionTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async makeRequest(endpoint, retryCount = 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TEST_CONFIG.timeout);

    try {
      const response = await fetch(`${RAILWAY_URL}${endpoint.path}`, {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Railway-Connection-Tester/1.0"
        },
        method: endpoint.method,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - this.startTime;
      const data = await response
        .json()
        .catch(() => ({ error: "Invalid JSON response" }));

      return {
        data,
        headers: Object.fromEntries(response.headers.entries()),
        responseTime,
        status: response.status,
        statusText: response.statusText,
        success: response.ok
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${TEST_CONFIG.timeout}ms`);
      }

      if (retryCount < TEST_CONFIG.retries) {
        console.log(
          `   ⏳ Retrying... (${retryCount + 1}/${TEST_CONFIG.retries})`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        );
        return this.makeRequest(endpoint, retryCount + 1);
      }

      throw error;
    }
  }

  async testEndpoint(endpoint) {
    console.log(`\n🔍 Testing: ${endpoint.name}`);
    console.log(`   URL: ${RAILWAY_URL}${endpoint.path}`);

    try {
      const result = await this.makeRequest(endpoint);

      if (result.success) {
        console.log(
          `   ✅ SUCCESS (${result.status}) - ${result.responseTime}ms`
        );

        // Show relevant data for specific endpoints
        if (endpoint.path === "/ping") {
          console.log(`   📊 Response: ${JSON.stringify(result.data)}`);
        } else if (endpoint.path === "/admin/stats") {
          console.log(
            `   📊 Total Users: ${result.data.data?.totalUsers || "N/A"}`
          );
          console.log(
            `   📊 Admin Users: ${result.data.data?.adminUsers?.total || "N/A"}`
          );
        } else if (endpoint.path === "/admin/features") {
          console.log(`   📊 Features Count: ${result.data.data?.length || 0}`);
        } else if (endpoint.path === "/admin/actions") {
          console.log(
            `   📊 Actions Count: ${result.data.data?.actions?.length || 0}`
          );
        } else if (endpoint.path.includes("/games/")) {
          console.log(
            `   📊 Games Count: ${result.data.data?.games?.length || 0}`
          );
        } else if (endpoint.path.includes("/live/")) {
          console.log(
            `   📊 Live Streams: ${result.data.data?.streams?.length || 0}`
          );
        }

        return { ...result, endpoint: endpoint.name, success: true };
      }

      console.log(`   ❌ FAILED (${result.status}) - ${result.statusText}`);
      console.log(`   📊 Error: ${JSON.stringify(result.data)}`);
      return { ...result, endpoint: endpoint.name, success: false };
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      return {
        endpoint: endpoint.name,
        error: error.message,
        status: "ERROR",
        success: false
      };
    }
  }

  async runAllTests() {
    console.log("🚀 Railway Backend Connection Test");
    console.log("=".repeat(50));
    console.log(`📍 Target URL: ${RAILWAY_URL}`);
    console.log(`⏰ Timeout: ${TEST_CONFIG.timeout}ms`);
    console.log(`🔄 Retries: ${TEST_CONFIG.retries}`);
    console.log(`📊 Total Endpoints: ${TEST_CONFIG.endpoints.length}`);

    this.startTime = Date.now();

    for (const endpoint of TEST_CONFIG.endpoints) {
      const result = await this.testEndpoint(endpoint);
      this.results.push(result);
    }

    this.generateReport();
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const successfulTests = this.results.filter((r) => r.success).length;
    const failedTests = this.results.filter((r) => !r.success).length;
    const successRate = ((successfulTests / this.results.length) * 100).toFixed(
      1
    );

    console.log("\n" + "=".repeat(50));
    console.log("📋 TEST SUMMARY REPORT");
    console.log("=".repeat(50));

    console.log(`\n⏱️  Total Test Time: ${totalTime}ms`);
    console.log(
      `✅ Successful Tests: ${successfulTests}/${this.results.length} (${successRate}%)`
    );
    console.log(`❌ Failed Tests: ${failedTests}/${this.results.length}`);

    if (successfulTests > 0) {
      const avgResponseTime =
        this.results
          .filter((r) => r.success && r.responseTime)
          .reduce((sum, r) => sum + r.responseTime, 0) / successfulTests;
      console.log(`⚡ Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
    }

    console.log("\n🔍 DETAILED RESULTS:");
    console.log("-".repeat(50));

    this.results.forEach((result) => {
      const status = result.success ? "✅" : "❌";
      const time = result.responseTime ? `(${result.responseTime}ms)` : "";
      console.log(`${status} ${result.endpoint} ${time}`);

      if (!result.success && result.error) {
        console.log(`   └─ Error: ${result.error}`);
      }
    });

    console.log("\n🎯 RECOMMENDATIONS:");
    if (successRate >= 80) {
      console.log("✅ Your Railway backend is working well!");
      console.log("   - Most endpoints are responding correctly");
      console.log("   - Consider monitoring response times for optimization");
    } else if (successRate >= 50) {
      console.log("⚠️  Your Railway backend has some issues:");
      console.log("   - Some endpoints are failing");
      console.log("   - Check Railway logs for errors");
      console.log("   - Verify environment variables are set correctly");
    } else {
      console.log("❌ Your Railway backend has significant issues:");
      console.log("   - Most endpoints are failing");
      console.log("   - Check if the deployment is running");
      console.log("   - Verify the Railway URL is correct");
      console.log("   - Check Railway dashboard for deployment status");
    }

    console.log("\n🔧 TROUBLESHOOTING STEPS:");
    console.log("1. Check Railway dashboard for deployment status");
    console.log("2. Verify environment variables are set correctly");
    console.log("3. Check Railway logs for error messages");
    console.log("4. Ensure database connection is working");
    console.log("5. Verify the application is starting properly");

    console.log("\n📊 HEALTH STATUS:");
    if (successRate >= 90) {
      console.log("🟢 EXCELLENT - Backend is healthy and responsive");
    } else if (successRate >= 70) {
      console.log("🟡 GOOD - Backend is mostly working with minor issues");
    } else if (successRate >= 50) {
      console.log("🟠 FAIR - Backend has some issues that need attention");
    } else {
      console.log(
        "🔴 POOR - Backend has significant issues requiring immediate attention"
      );
    }
  }
}

// Run the tests
async function main() {
  const tester = new RailwayConnectionTester();
  await tester.runAllTests();
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

main().catch((error) => {
  console.error("Test runner failed:", error);
  process.exit(1);
});
