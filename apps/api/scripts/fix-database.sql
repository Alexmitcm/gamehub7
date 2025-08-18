-- Fix PremiumProfile table by adding missing columns
-- This script should be run on the Railway database

-- Add walletType column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'PremiumProfile' AND column_name = 'walletType') THEN
        ALTER TABLE "PremiumProfile" ADD COLUMN "walletType" TEXT NOT NULL DEFAULT 'MetaMask';
    END IF;
END $$;

-- Add lensWalletAddress column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'PremiumProfile' AND column_name = 'lensWalletAddress') THEN
        ALTER TABLE "PremiumProfile" ADD COLUMN "lensWalletAddress" TEXT;
    END IF;
END $$;

-- Add registrationTxHash column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'PremiumProfile' AND column_name = 'registrationTxHash') THEN
        ALTER TABLE "PremiumProfile" ADD COLUMN "registrationTxHash" TEXT;
    END IF;
END $$;

-- Create index on walletType if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                   WHERE tablename = 'PremiumProfile' AND indexname = 'PremiumProfile_walletType_idx') THEN
        CREATE INDEX "PremiumProfile_walletType_idx" ON "PremiumProfile"("walletType");
    END IF;
END $$;
