import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log("🔍 Railway Setup Check");
console.log("=" .repeat(40));

// Check if Railway CLI is installed
console.log("1️⃣ Checking Railway CLI installation...");

try {
  const railwayVersion = execSync('railway --version', { encoding: 'utf8' });
  console.log(`✅ Railway CLI installed: ${railwayVersion.trim()}`);
} catch {
  console.log("❌ Railway CLI not found");
  console.log("\n📦 Install Railway CLI:");
  console.log("   npm install -g @railway/cli");
  console.log("   or");
  console.log("   pnpm add -g @railway/cli");
  console.log("\n🔗 Or visit: https://docs.railway.app/reference/cli");
  process.exit(1);
}

// Check if logged in
console.log("\n2️⃣ Checking Railway login status...");

try {
  const status = execSync('railway status', { encoding: 'utf8' });
  console.log("✅ Logged into Railway");
  console.log("📊 Current project status:");
  console.log(status);
} catch (error) {
  console.log("❌ Not logged in or no project linked");
  console.log("\n🔐 Login to Railway:");
  console.log("   railway login");
  console.log("\n🔗 Link to project:");
  console.log("   railway link");
  console.log("\n🆕 Create new project:");
  console.log("   railway init");
}

// Check for railway.json
console.log("\n3️⃣ Checking Railway configuration...");

if (existsSync('railway.json')) {
  console.log("✅ railway.json found");
  const railwayConfig = JSON.parse(execSync('cat railway.json', { encoding: 'utf8' }));
  console.log("📋 Configuration:");
  console.log(`   - Builder: ${railwayConfig.build?.builder || 'N/A'}`);
  console.log(`   - Runtime: ${railwayConfig.deploy?.runtime || 'N/A'}`);
  console.log(`   - Replicas: ${railwayConfig.deploy?.numReplicas || 'N/A'}`);
} else {
  console.log("❌ railway.json not found");
  console.log("\n📝 Create railway.json:");
  console.log("   railway init");
}

// Check package.json scripts
console.log("\n4️⃣ Checking package.json scripts...");

try {
  const packageJson = JSON.parse(execSync('cat package.json', { encoding: 'utf8' }));
  const scripts = packageJson.scripts || {};
  
  const requiredScripts = ['start', 'build'];
  const missingScripts = requiredScripts.filter(script => !scripts[script]);
  
  if (missingScripts.length === 0) {
    console.log("✅ All required scripts found");
    console.log("📋 Available scripts:");
    Object.entries(scripts).forEach(([name, command]) => {
      console.log(`   - ${name}: ${command}`);
    });
  } else {
    console.log(`❌ Missing scripts: ${missingScripts.join(', ')}`);
    console.log("\n📝 Add these scripts to package.json:");
    missingScripts.forEach(script => {
      if (script === 'start') {
        console.log(`   "start": "tsx src/index.ts"`);
      } else if (script === 'build') {
        console.log(`   "build": "prisma generate --schema ./src/prisma/schema.prisma"`);
      }
    });
  }
} catch (error) {
  console.log("❌ Error reading package.json");
}

// Check for environment variables
console.log("\n5️⃣ Checking environment variables...");

try {
  const envVars = execSync('railway variables', { encoding: 'utf8' });
  console.log("✅ Environment variables found:");
  console.log(envVars);
} catch (error) {
  console.log("❌ No environment variables set or not logged in");
  console.log("\n🔧 Set required environment variables:");
  console.log("   railway variables set DATABASE_URL=\"your-database-url\"");
  console.log("   railway variables set NODE_ENV=\"production\"");
  console.log("   railway variables set PORT=\"8080\"");
  console.log("   railway variables set JWT_SECRET=\"your-jwt-secret\"");
}

console.log("\n" + "=".repeat(40));
console.log("📋 NEXT STEPS:");
console.log("=".repeat(40));

console.log("\n🚀 To deploy your backend:");
console.log("1. Ensure Railway CLI is installed and you're logged in");
console.log("2. Set up environment variables (especially DATABASE_URL)");
console.log("3. Run: railway up");
console.log("4. Run: railway shell");
console.log("5. In shell, run: npx prisma migrate deploy");
console.log("6. Test with: node quick-railway-test.mjs");

console.log("\n🔗 Useful commands:");
console.log("- railway status (check deployment status)");
console.log("- railway logs (view logs)");
console.log("- railway open (open in browser)");
console.log("- railway variables (manage env vars)");

console.log("\n📚 Documentation:");
console.log("- Railway CLI: https://docs.railway.app/reference/cli");
console.log("- Railway Dashboard: https://railway.app");
console.log("- Deployment Guide: railway-deployment-guide.md");
