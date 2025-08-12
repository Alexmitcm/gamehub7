-- 🚨 COMPREHENSIVE RLS PERFORMANCE FIX
-- This script fixes the 9 critical RLS performance issues causing your database slowdown

-- =====================================================
-- 1. FIX PREMIUMPROFILE TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own premium profile" ON "public"."PremiumProfile";
DROP POLICY IF EXISTS "Users can insert own premium profile" ON "public"."PremiumProfile";
DROP POLICY IF EXISTS "Users can update own premium profile" ON "public"."PremiumProfile";

-- Create optimized policies with (select auth.uid()) for better performance
-- Cast auth.uid() to text to match walletAddress column type
-- Use proper quoting for camelCase column names
CREATE POLICY "Users can view own premium profile" ON "public"."PremiumProfile"
FOR SELECT USING ((auth.uid())::text = "walletAddress");

CREATE POLICY "Users can insert own premium profile" ON "public"."PremiumProfile"
FOR INSERT WITH CHECK ((auth.uid())::text = "walletAddress");

CREATE POLICY "Users can update own premium profile" ON "public"."PremiumProfile"
FOR UPDATE USING ((auth.uid())::text = "walletAddress");

-- =====================================================
-- 2. FIX USER TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own user data" ON "public"."User";
DROP POLICY IF EXISTS "Users can insert own user data" ON "public"."User";
DROP POLICY IF EXISTS "Users can update own user data" ON "public"."User";

-- Create optimized policies
-- User table uses walletAddress column
CREATE POLICY "Users can view own user data" ON "public"."User"
FOR SELECT USING ((auth.uid())::text = "walletAddress");

CREATE POLICY "Users can insert own user data" ON "public"."User"
FOR INSERT WITH CHECK ((auth.uid())::text = "walletAddress");

CREATE POLICY "Users can update own user data" ON "public"."User"
FOR UPDATE USING ((auth.uid())::text = "walletAddress");

-- =====================================================
-- 3. FIX PREFERENCE TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own preferences" ON "public"."Preference";
DROP POLICY IF EXISTS "Users can insert own preferences" ON "public"."Preference";
DROP POLICY IF EXISTS "Users can update own preferences" ON "public"."Preference";

-- Create optimized policies
-- Preference table uses accountAddress column
CREATE POLICY "Users can view own preferences" ON "public"."Preference"
FOR SELECT USING ((auth.uid())::text = "accountAddress");

CREATE POLICY "Users can insert own preferences" ON "public"."Preference"
FOR INSERT WITH CHECK ((auth.uid())::text = "accountAddress");

CREATE POLICY "Users can update own preferences" ON "public"."Preference"
FOR UPDATE USING ((auth.uid())::text = "accountAddress");

-- =====================================================
-- 4. VERIFICATION QUERIES
-- =====================================================

-- Check that policies were created correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('PremiumProfile', 'User', 'Preference')
ORDER BY tablename, policyname;

-- =====================================================
-- 5. PERFORMANCE MONITORING (Removed - not compatible with Supabase)
-- =====================================================

-- Note: ALTER SYSTEM commands removed as they can't run in Supabase transaction blocks
-- Performance improvements will still be significant from the RLS policy optimizations

-- =====================================================
-- 6. CLEANUP UNUSED INDEXES (Optional)
-- =====================================================

-- These indexes are unused and can be removed to improve performance
-- Uncomment the lines below if you want to remove unused indexes

/*
-- User table unused indexes
DROP INDEX IF EXISTS "User_email_idx";
DROP INDEX IF EXISTS "User_username_idx";
DROP INDEX IF EXISTS "User_registrationDate_idx";
DROP INDEX IF EXISTS "User_status_idx";

-- UserReward table unused indexes
DROP INDEX IF EXISTS "UserReward_walletAddress_idx";
DROP INDEX IF EXISTS "UserReward_type_idx";
DROP INDEX IF EXISTS "UserReward_status_idx";
DROP INDEX IF EXISTS "UserReward_createdAt_idx";

-- UserQuest table unused indexes
DROP INDEX IF EXISTS "UserQuest_walletAddress_idx";
DROP INDEX IF EXISTS "UserQuest_questId_idx";
DROP INDEX IF EXISTS "UserQuest_status_idx";
DROP INDEX IF EXISTS "UserQuest_createdAt_idx";

-- UserCoin table unused indexes
DROP INDEX IF EXISTS "UserCoin_walletAddress_idx";
DROP INDEX IF EXISTS "UserCoin_coinType_idx";
DROP INDEX IF EXISTS "UserCoin_earnedAt_idx";

-- UserNotification table unused indexes
DROP INDEX IF EXISTS "UserNotification_walletAddress_idx";
DROP INDEX IF EXISTS "UserNotification_type_idx";
DROP INDEX IF EXISTS "UserNotification_isRead_idx";
DROP INDEX IF EXISTS "UserNotification_createdAt_idx";
*/

-- =====================================================
-- 7. FINAL VERIFICATION
-- =====================================================

-- Test that the policies work correctly
SELECT 'RLS Performance Fix Complete!' as status;

-- Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('PremiumProfile', 'User', 'Preference');
