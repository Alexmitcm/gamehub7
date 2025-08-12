import { createClient } from "@supabase/supabase-js";

async function testSupabaseDirect() {
  try {
    console.log("🔍 Testing direct Supabase connection...");

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

    console.log("\n🌐 Testing Supabase API connection...");

    // Test 1: Basic API connection
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey
        }
      });

      if (response.ok) {
        console.log("✅ Supabase API connection successful");
        console.log(`   Status: ${response.status}`);
      } else {
        console.log("❌ Supabase API connection failed");
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${await response.text()}`);
      }
    } catch (fetchError) {
      console.log(
        "❌ Supabase API connection failed with error:",
        fetchError.message
      );
    }

    // Test 2: Database access through Supabase client
    console.log("\n🗄️ Testing database access through Supabase client...");

    try {
      const { data: premiumProfiles, error: premiumError } = await supabase
        .from("PremiumProfile")
        .select("*")
        .limit(1);

      if (premiumError) {
        console.log("❌ PremiumProfile access failed:", premiumError.message);
        console.log("   Error details:", premiumError);
      } else {
        console.log("✅ PremiumProfile access successful");
        console.log(`   Records found: ${premiumProfiles?.length || 0}`);
        if (premiumProfiles && premiumProfiles.length > 0) {
          console.log("   Sample record:", premiumProfiles[0]);
        }
      }
    } catch (apiError) {
      console.log("❌ PremiumProfile API test failed:", apiError.message);
    }

    // Test 3: User table access
    console.log("\n👤 Testing User table access...");

    try {
      const { data: users, error: userError } = await supabase
        .from("User")
        .select("*")
        .limit(1);

      if (userError) {
        console.log("❌ User table access failed:", userError.message);
      } else {
        console.log("✅ User table access successful");
        console.log(`   Records found: ${users?.length || 0}`);
      }
    } catch (apiError) {
      console.log("❌ User table API test failed:", apiError.message);
    }

    // Test 4: Preference table access
    console.log("\n⚙️ Testing Preference table access...");

    try {
      const { data: preferences, error: prefError } = await supabase
        .from("Preference")
        .select("*")
        .limit(1);

      if (prefError) {
        console.log("❌ Preference table access failed:", prefError.message);
      } else {
        console.log("✅ Preference table access successful");
        console.log(`   Records found: ${preferences?.length || 0}`);
      }
    } catch (apiError) {
      console.log("❌ Preference table API test failed:", apiError.message);
    }
  } catch (error) {
    console.error("❌ Supabase direct test failed:", error);
  }

  console.log("\n🔧 Next steps:");
  console.log("   1. Check Supabase dashboard for project status");
  console.log("   2. Verify project is not paused or suspended");
  console.log("   3. Check if you need to upgrade your plan");
  console.log("   4. Look for any maintenance notices");
  console.log("   5. Check database connection settings");
}

testSupabaseDirect()
  .then(() => {
    console.log("\n✅ Supabase direct tests completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Tests failed:", error);
    process.exit(1);
  });
