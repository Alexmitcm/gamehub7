import prisma from "../src/prisma/client";
import { randomUUID } from "crypto";

async function setupAdminSystem() {
  console.log("🚀 Setting up Admin System...");

  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Create SuperAdmin user
    const superAdmin = await prisma.adminUser.upsert({
      where: { walletAddress: "0x1234567890abcdef1234567890abcdef12345678" },
      update: {},
      create: {
        id: randomUUID(),
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
        email: "superadmin@hey.com",
        username: "superadmin",
        displayName: "Super Administrator",
        role: "SuperAdmin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log("✅ Created SuperAdmin user:", superAdmin.username);

    // Create SupportAgent user
    const supportAgent = await prisma.adminUser.upsert({
      where: { walletAddress: "0x876543210fedcba9876543210fedcba9876543210" },
      update: {},
      create: {
        id: randomUUID(),
        walletAddress: "0x876543210fedcba9876543210fedcba9876543210",
        email: "support@hey.com",
        username: "support_agent",
        displayName: "Support Agent",
        role: "SupportAgent",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log("✅ Created SupportAgent user:", supportAgent.username);

    // Create default features
    const defaultFeatures = [
      {
        featureId: "premium_chat",
        name: "Premium Chat",
        description: "Advanced chat features for premium users",
        category: "communication",
        standardAccess: false,
        premiumAccess: true,
        adminOverride: true,
        isActive: true
      },
      {
        featureId: "advanced_analytics",
        name: "Advanced Analytics",
        description: "Detailed analytics and reporting features",
        category: "analytics",
        standardAccess: false,
        premiumAccess: true,
        adminOverride: true,
        isActive: true
      },
      {
        featureId: "priority_support",
        name: "Priority Support",
        description: "Priority customer support access",
        category: "support",
        standardAccess: false,
        premiumAccess: true,
        adminOverride: true,
        isActive: true
      },
      {
        featureId: "basic_chat",
        name: "Basic Chat",
        description: "Basic chat functionality for all users",
        category: "communication",
        standardAccess: true,
        premiumAccess: true,
        adminOverride: false,
        isActive: true
      }
    ];

    for (const feature of defaultFeatures) {
      await prisma.feature.upsert({
        where: { featureId: feature.featureId },
        update: {},
        create: {
          id: randomUUID(),
          ...feature,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    console.log("✅ Created default features");

    console.log("\n🎉 Admin System Setup Complete!");
    console.log("\n📋 Summary:");
    console.log(`- Created ${2} admin users (SuperAdmin, SupportAgent)`);
    console.log(`- Created ${defaultFeatures.length} default features`);
    
    console.log("\n🔑 Admin User Credentials:");
    console.log("SuperAdmin: 0x1234567890abcdef1234567890abcdef12345678");
    console.log("SupportAgent: 0x876543210fedcba9876543210fedcba9876543210");
    
    console.log("\n⚠️  IMPORTANT: Change these wallet addresses in production!");

  } catch (error) {
    console.error("❌ Error setting up admin system:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupAdminSystem()
  .then(() => {
    console.log("\n✅ Setup completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Setup failed:", error);
    process.exit(1);
  });
