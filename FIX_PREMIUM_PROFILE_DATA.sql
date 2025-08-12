-- Fix PremiumProfile data corruption
-- This script fixes records where profileId equals walletAddress

-- First, let's see what we're working with
SELECT 
    id,
    "walletAddress",
    "profileId",
    "isActive",
    "linkedAt"
FROM "PremiumProfile"
WHERE "profileId" = "walletAddress";

-- Update the corrupted record to have a unique profileId
-- We'll use a timestamp-based approach to ensure uniqueness
UPDATE "PremiumProfile" 
SET "profileId" = '0x' || LPAD(CAST(EXTRACT(EPOCH FROM NOW()) AS TEXT), 40, '0')
WHERE "profileId" = "walletAddress";

-- Verify the fix
SELECT 
    id,
    "walletAddress",
    "profileId",
    "isActive",
    "linkedAt"
FROM "PremiumProfile";

-- Optional: If you want to completely remove the corrupted record instead:
-- DELETE FROM "PremiumProfile" WHERE "profileId" = "walletAddress";
