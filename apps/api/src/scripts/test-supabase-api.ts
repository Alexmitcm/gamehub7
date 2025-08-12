import { createClient } from "@supabase/supabase-js";

async function testSupabaseAPI() {
  try {
    console.log("🔍 Testing Supabase API access...");

    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log("❌ Missing Supabase environment variables");
      console.log(`   SUPABASE_URL: ${supabaseUrl ? "✅ Set" : "❌ Not set"}`);
      console.log(`   SUPABASE_KEY: ${supabaseKey ? "✅ Set" : "❌ Not set"}`);
      return;
    }

    console.log("✅ Environment variables are set");
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("\n🌐 Testing API connection...");

    // Test basic connection by getting project info
    const { data: _projectInfo, error: projectError } =
      await supabase.auth.getUser();

    if (projectError) {
      console.log("❌ Failed to get project info:", projectError.message);

      // Try a different approach - test if we can access the project
      console.log("\n🔄 Trying alternative API test...");

      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey
          }
        });

        if (response.ok) {
          console.log("✅ Alternative API test successful");
          console.log(`   Status: ${response.status}`);
        } else {
          console.log("❌ Alternative API test failed");
          console.log(`   Status: ${response.status}`);
          console.log(`   Response: ${await response.text()}`);
        }
      } catch (fetchError) {
        console.log(
          "❌ Alternative API test failed with error:",
          fetchError.message
        );
      }
    } else {
      console.log("✅ API connection successful");
      console.log("   Project info retrieved");
    }

    // Test if we can access the database through the API
    console.log("\n🗄️ Testing database access through API...");

    try {
      const { data: tables, error: tablesError } = await supabase
        .from("PremiumProfile")
        .select("*")
        .limit(1);

      if (tablesError) {
        console.log(
          "❌ Database access through API failed:",
          tablesError.message
        );
      } else {
        console.log("✅ Database access through API successful");
        console.log(`   Records found: ${tables?.length || 0}`);
      }
    } catch (apiError) {
      console.log("❌ Database API test failed:", apiError.message);
    }
  } catch (error) {
    console.error("❌ Supabase API test failed:", error);
  }

  console.log("\n🔧 Next steps:");
  console.log("   1. Check Supabase dashboard for project status");
  console.log("   2. Verify project is not paused or suspended");
  console.log("   3. Check if you need to upgrade your plan");
  console.log("   4. Look for any maintenance notices");
  console.log("   5. Try accessing the project from Supabase dashboard");
}

testSupabaseAPI()
  .then(() => {
    console.log("\n✅ Supabase API tests completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Tests failed:", error);
    process.exit(1);
  });
