-- 🚨 COMPREHENSIVE FIX FOR SUPABASE ISSUES
-- This script fixes both RLS security issues and data corruption

-- Step 1: Enable RLS on all public tables
ALTER TABLE "public"."PremiumProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Preference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."UserCoin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."UserNotification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."UserQuest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."UserReward" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."UserStats" ENABLE ROW LEVEL SECURITY;

-- Step 2: Fix the corrupted PremiumProfile data
-- Update profileId to be different from walletAddress
UPDATE "public"."PremiumProfile" 
SET "profileId" = '0x' || LPAD(CAST(EXTRACT(EPOCH FROM NOW()) AS TEXT), 40, '0')
WHERE "profileId" = "walletAddress";

-- Step 3: Create basic RLS policies for PremiumProfile
-- Policy: Users can only see their own premium profile
CREATE POLICY "Users can view own premium profile" ON "public"."PremiumProfile"
    FOR SELECT USING (
        "walletAddress" = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        OR 
        "profileId" = current_setting('request.jwt.claims', true)::json->>'profile_id'
    );

-- Policy: Users can insert their own premium profile
CREATE POLICY "Users can insert own premium profile" ON "public"."PremiumProfile"
    FOR INSERT WITH CHECK (
        "walletAddress" = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    );

-- Policy: Users can update their own premium profile
CREATE POLICY "Users can update own premium profile" ON "public"."PremiumProfile"
    FOR UPDATE USING (
        "walletAddress" = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    );

-- Step 4: Create basic RLS policies for User table
CREATE POLICY "Users can view own user data" ON "public"."User"
    FOR SELECT USING (
        "walletAddress" = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    );

CREATE POLICY "Users can insert own user data" ON "public"."User"
    FOR INSERT WITH CHECK (
        "walletAddress" = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    );

CREATE POLICY "Users can update own user data" ON "public"."User"
    FOR UPDATE USING (
        "walletAddress" = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    );

-- Step 5: Create basic RLS policies for Preference table
CREATE POLICY "Users can view own preferences" ON "public"."Preference"
    FOR SELECT USING (
        "accountAddress" = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    );

CREATE POLICY "Users can insert own preferences" ON "public"."Preference"
    FOR INSERT WITH CHECK (
        "accountAddress" = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    );

CREATE POLICY "Users can update own preferences" ON "public"."Preference"
    FOR UPDATE USING (
        "accountAddress" = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    );

-- Step 6: Verify the fixes
-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'PremiumProfile', 'User', 'Preference', 'UserCoin', 
    'UserNotification', 'UserQuest', 'UserReward', 'UserStats'
);

-- Check PremiumProfile data integrity
SELECT 
    id,
    "walletAddress",
    "profileId",
    "isActive",
    "linkedAt",
    CASE 
        WHEN "walletAddress" = "profileId" THEN '❌ CORRUPTED'
        ELSE '✅ OK'
    END as status
FROM "public"."PremiumProfile";

-- Show all tables with RLS status
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
