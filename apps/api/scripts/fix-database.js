const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database schema...');
    
    // Add missing columns to PremiumProfile table
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'PremiumProfile' AND column_name = 'walletType') THEN
              ALTER TABLE "PremiumProfile" ADD COLUMN "walletType" TEXT NOT NULL DEFAULT 'MetaMask';
          END IF;
      END $$;
    `;
    
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'PremiumProfile' AND column_name = 'lensWalletAddress') THEN
              ALTER TABLE "PremiumProfile" ADD COLUMN "lensWalletAddress" TEXT;
          END IF;
      END $$;
    `;
    
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'PremiumProfile' AND column_name = 'registrationTxHash') THEN
              ALTER TABLE "PremiumProfile" ADD COLUMN "registrationTxHash" TEXT;
          END IF;
      END $$;
    `;
    
    // Create index if it doesn't exist
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                         WHERE tablename = 'PremiumProfile' AND indexname = 'PremiumProfile_walletType_idx') THEN
              CREATE INDEX "PremiumProfile_walletType_idx" ON "PremiumProfile"("walletType");
          END IF;
      END $$;
    `;
    
    console.log('✅ Database schema fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixDatabase()
  .then(() => {
    console.log('🎉 Database fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database fix failed:', error);
    process.exit(1);
  });
