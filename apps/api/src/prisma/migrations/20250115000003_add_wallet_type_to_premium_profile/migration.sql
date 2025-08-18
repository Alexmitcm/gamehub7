-- Add walletType column to PremiumProfile table
ALTER TABLE "PremiumProfile" ADD COLUMN "walletType" TEXT NOT NULL DEFAULT 'MetaMask';

-- Add lensWalletAddress column to PremiumProfile table
ALTER TABLE "PremiumProfile" ADD COLUMN "lensWalletAddress" TEXT;

-- Add registrationTxHash column to PremiumProfile table
ALTER TABLE "PremiumProfile" ADD COLUMN "registrationTxHash" TEXT;

-- Create index on walletType column
CREATE INDEX "PremiumProfile_walletType_idx" ON "PremiumProfile"("walletType");
