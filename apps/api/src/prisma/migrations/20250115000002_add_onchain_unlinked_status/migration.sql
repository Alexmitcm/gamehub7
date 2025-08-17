-- Add OnChainUnlinked status to UserStatus enum
ALTER TYPE "UserStatus" ADD VALUE 'OnChainUnlinked';

-- Update existing users who might be in an inconsistent state
-- This is a safety measure to ensure data consistency
UPDATE "User" 
SET status = 'Standard' 
WHERE status = 'Premium' 
AND "walletAddress" NOT IN (
  SELECT "walletAddress" 
  FROM "PremiumProfile" 
  WHERE "isActive" = true
);
