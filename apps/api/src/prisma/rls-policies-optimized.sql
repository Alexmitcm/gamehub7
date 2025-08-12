-- Optimized Row Level Security (RLS) Policies for Supabase
-- This file addresses performance warnings by:
-- 1. Using (SELECT auth.<function>()) instead of auth.<function>() directly
-- 2. Consolidating multiple permissive policies into single policies

-- ============================================================================
-- UserCoin Table Policies (Optimized)
-- ============================================================================

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own coins" ON "public"."UserCoin";
    DROP POLICY IF EXISTS "Users can insert own coins" ON "public"."UserCoin";
    DROP POLICY IF EXISTS "Users can update own coins" ON "public"."UserCoin";
    DROP POLICY IF EXISTS "Users can delete own coins" ON "public"."UserCoin";

    -- Create optimized policies
    CREATE POLICY "Users can view own coins" ON "public"."UserCoin"
    FOR SELECT USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can insert own coins" ON "public"."UserCoin"
    FOR INSERT WITH CHECK ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can update own coins" ON "public"."UserCoin"
    FOR UPDATE USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can delete own coins" ON "public"."UserCoin"
    FOR DELETE USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");
END $$;

-- ============================================================================
-- UserNotification Table Policies (Optimized)
-- ============================================================================

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own notifications" ON "public"."UserNotification";
    DROP POLICY IF EXISTS "Users can insert own notifications" ON "public"."UserNotification";
    DROP POLICY IF EXISTS "Users can update own notifications" ON "public"."UserNotification";
    DROP POLICY IF EXISTS "Users can delete own notifications" ON "public"."UserNotification";

    -- Create optimized policies
    CREATE POLICY "Users can view own notifications" ON "public"."UserNotification"
    FOR SELECT USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can insert own notifications" ON "public"."UserNotification"
    FOR INSERT WITH CHECK ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can update own notifications" ON "public"."UserNotification"
    FOR UPDATE USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can delete own notifications" ON "public"."UserNotification"
    FOR DELETE USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");
END $$;

-- ============================================================================
-- UserPreferences Table Policies (Optimized)
-- ============================================================================

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own preferences" ON "public"."UserPreferences";
    DROP POLICY IF EXISTS "Users can insert own preferences" ON "public"."UserPreferences";
    DROP POLICY IF EXISTS "Users can update own preferences" ON "public"."UserPreferences";
    DROP POLICY IF EXISTS "Users can delete own preferences" ON "public"."UserPreferences";

    -- Create optimized policies
    CREATE POLICY "Users can view own preferences" ON "public"."UserPreferences"
    FOR SELECT USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can insert own preferences" ON "public"."UserPreferences"
    FOR INSERT WITH CHECK ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can update own preferences" ON "public"."UserPreferences"
    FOR UPDATE USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can delete own preferences" ON "public"."UserPreferences"
    FOR DELETE USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");
END $$;

-- ============================================================================
-- UserQuest Table Policies (Optimized)
-- ============================================================================

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own quests" ON "public"."UserQuest";
    DROP POLICY IF EXISTS "Users can insert own quests" ON "public"."UserQuest";
    DROP POLICY IF EXISTS "Users can update own quests" ON "public"."UserQuest";
    DROP POLICY IF EXISTS "Users can delete own quests" ON "public"."UserQuest";

    -- Create optimized policies
    CREATE POLICY "Users can view own quests" ON "public"."UserQuest"
    FOR SELECT USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can insert own quests" ON "public"."UserQuest"
    FOR INSERT WITH CHECK ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can update own quests" ON "public"."UserQuest"
    FOR UPDATE USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can delete own quests" ON "public"."UserQuest"
    FOR DELETE USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");
END $$;

-- ============================================================================
-- UserReward Table Policies (Optimized)
-- ============================================================================

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own rewards" ON "public"."UserReward";
    DROP POLICY IF EXISTS "Users can insert own rewards" ON "public"."UserReward";
    DROP POLICY IF EXISTS "Users can update own rewards" ON "public"."UserReward";
    DROP POLICY IF EXISTS "Users can delete own rewards" ON "public"."UserReward";

    -- Create optimized policies
    CREATE POLICY "Users can view own rewards" ON "public"."UserReward"
    FOR SELECT USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can insert own rewards" ON "public"."UserReward"
    FOR INSERT WITH CHECK ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can update own rewards" ON "public"."UserReward"
    FOR UPDATE USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can delete own rewards" ON "public"."UserReward"
    FOR DELETE USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");
END $$;

-- ============================================================================
-- UserStats Table Policies (Optimized)
-- ============================================================================

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own stats" ON "public"."UserStats";
    DROP POLICY IF EXISTS "Users can insert own stats" ON "public"."UserStats";
    DROP POLICY IF EXISTS "Users can update own stats" ON "public"."UserStats";
    DROP POLICY IF EXISTS "Users can delete own stats" ON "public"."UserStats";

    -- Create optimized policies
    CREATE POLICY "Users can view own stats" ON "public"."UserStats"
    FOR SELECT USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can insert own stats" ON "public"."UserStats"
    FOR INSERT WITH CHECK ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can update own stats" ON "public"."UserStats"
    FOR UPDATE USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");

    CREATE POLICY "Users can delete own stats" ON "public"."UserStats"
    FOR DELETE USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");
END $$;

-- ============================================================================
-- _prisma_migrations Table Policies (Optimized)
-- ============================================================================

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Authenticated users can view migrations" ON "public"."_prisma_migrations";
    DROP POLICY IF EXISTS "Service role can modify migrations" ON "public"."_prisma_migrations";

    -- Create optimized consolidated policy
    CREATE POLICY "Migrations access control" ON "public"."_prisma_migrations"
    FOR ALL USING (
        (SELECT auth.role()) = 'authenticated' OR 
        (SELECT auth.role()) = 'service_role'
    );
END $$;

-- ============================================================================
-- User Table Policies (Optimized - Consolidated)
-- ============================================================================

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own profile" ON "public"."User";
    DROP POLICY IF EXISTS "Users can update own profile" ON "public"."User";
    DROP POLICY IF EXISTS "Public can view basic user info" ON "public"."User";

    -- Create optimized consolidated policies
    CREATE POLICY "User access control" ON "public"."User"
    FOR SELECT USING (
        -- Users can view their own profile OR public can view basic info for active profiles
        (SELECT auth.jwt() ->> 'wallet_address') = "walletAddress" OR
        ("status" = 'Standard' OR "status" = 'Premium')
    );

    CREATE POLICY "User update control" ON "public"."User"
    FOR UPDATE USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");
END $$;

-- ============================================================================
-- PremiumProfile Table Policies (Optimized - Consolidated)
-- ============================================================================

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own premium profile" ON "public"."PremiumProfile";
    DROP POLICY IF EXISTS "Users can update own premium profile" ON "public"."PremiumProfile";
    DROP POLICY IF EXISTS "Public can view active premium profiles" ON "public"."PremiumProfile";

    -- Create optimized consolidated policies
    CREATE POLICY "PremiumProfile access control" ON "public"."PremiumProfile"
    FOR SELECT USING (
        -- Users can view their own profile OR public can view active profiles
        (SELECT auth.jwt() ->> 'wallet_address') = "walletAddress" OR
        "isActive" = true
    );

    CREATE POLICY "PremiumProfile update control" ON "public"."PremiumProfile"
    FOR UPDATE USING ((SELECT auth.jwt() ->> 'wallet_address') = "walletAddress");
END $$;

-- ============================================================================
-- Preference Table Policies (Optimized)
-- ============================================================================

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own preferences" ON "public"."Preference";
    DROP POLICY IF EXISTS "Users can update own preferences" ON "public"."Preference";
    DROP POLICY IF EXISTS "Users can insert own preferences" ON "public"."Preference";

    -- Create optimized policies
    CREATE POLICY "Users can view own preferences" ON "public"."Preference"
    FOR SELECT USING ((SELECT auth.jwt() ->> 'wallet_address') = "accountAddress");

    CREATE POLICY "Users can update own preferences" ON "public"."Preference"
    FOR UPDATE USING ((SELECT auth.jwt() ->> 'wallet_address') = "accountAddress");

    CREATE POLICY "Users can insert own preferences" ON "public"."Preference"
    FOR INSERT WITH CHECK ((SELECT auth.jwt() ->> 'wallet_address') = "accountAddress");
END $$;
