-- Row Level Security (RLS) Policies for Supabase
-- This file contains policies for tables that have RLS enabled but no policies
-- Uses DO blocks to safely create policies without conflicts

-- ============================================================================
-- UserCoin Table Policies
-- ============================================================================

DO $$
BEGIN
    -- Policy: Users can only view their own coins
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserCoin' AND policyname = 'Users can view own coins') THEN
        CREATE POLICY "Users can view own coins" ON "public"."UserCoin"
        FOR SELECT USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can insert their own coins
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserCoin' AND policyname = 'Users can insert own coins') THEN
        CREATE POLICY "Users can insert own coins" ON "public"."UserCoin"
        FOR INSERT WITH CHECK (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can update their own coins
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserCoin' AND policyname = 'Users can update own coins') THEN
        CREATE POLICY "Users can update own coins" ON "public"."UserCoin"
        FOR UPDATE USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can delete their own coins
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserCoin' AND policyname = 'Users can delete own coins') THEN
        CREATE POLICY "Users can delete own coins" ON "public"."UserCoin"
        FOR DELETE USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;
END $$;

-- ============================================================================
-- UserNotification Table Policies
-- ============================================================================

DO $$
BEGIN
    -- Policy: Users can only view their own notifications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserNotification' AND policyname = 'Users can view own notifications') THEN
        CREATE POLICY "Users can view own notifications" ON "public"."UserNotification"
        FOR SELECT USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can insert their own notifications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserNotification' AND policyname = 'Users can insert own notifications') THEN
        CREATE POLICY "Users can insert own notifications" ON "public"."UserNotification"
        FOR INSERT WITH CHECK (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can update their own notifications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserNotification' AND policyname = 'Users can update own notifications') THEN
        CREATE POLICY "Users can update own notifications" ON "public"."UserNotification"
        FOR UPDATE USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can delete their own notifications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserNotification' AND policyname = 'Users can delete own notifications') THEN
        CREATE POLICY "Users can delete own notifications" ON "public"."UserNotification"
        FOR DELETE USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;
END $$;

-- ============================================================================
-- UserPreferences Table Policies
-- ============================================================================

DO $$
BEGIN
    -- Policy: Users can only view their own preferences
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserPreferences' AND policyname = 'Users can view own preferences') THEN
        CREATE POLICY "Users can view own preferences" ON "public"."UserPreferences"
        FOR SELECT USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can insert their own preferences
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserPreferences' AND policyname = 'Users can insert own preferences') THEN
        CREATE POLICY "Users can insert own preferences" ON "public"."UserPreferences"
        FOR INSERT WITH CHECK (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can update their own preferences
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserPreferences' AND policyname = 'Users can update own preferences') THEN
        CREATE POLICY "Users can update own preferences" ON "public"."UserPreferences"
        FOR UPDATE USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can delete their own preferences
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserPreferences' AND policyname = 'Users can delete own preferences') THEN
        CREATE POLICY "Users can delete own preferences" ON "public"."UserPreferences"
        FOR DELETE USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;
END $$;

-- ============================================================================
-- UserQuest Table Policies
-- ============================================================================

DO $$
BEGIN
    -- Policy: Users can only view their own quests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserQuest' AND policyname = 'Users can view own quests') THEN
        CREATE POLICY "Users can view own quests" ON "public"."UserQuest"
        FOR SELECT USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can insert their own quests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserQuest' AND policyname = 'Users can insert own quests') THEN
        CREATE POLICY "Users can insert own quests" ON "public"."UserQuest"
        FOR INSERT WITH CHECK (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can update their own quests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserQuest' AND policyname = 'Users can update own quests') THEN
        CREATE POLICY "Users can update own quests" ON "public"."UserQuest"
        FOR UPDATE USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can delete their own quests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserQuest' AND policyname = 'Users can delete own quests') THEN
        CREATE POLICY "Users can delete own quests" ON "public"."UserQuest"
        FOR DELETE USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;
END $$;

-- ============================================================================
-- UserReward Table Policies
-- ============================================================================

DO $$
BEGIN
    -- Policy: Users can only view their own rewards
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserReward' AND policyname = 'Users can view own rewards') THEN
        CREATE POLICY "Users can view own rewards" ON "public"."UserReward"
        FOR SELECT USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can insert their own rewards
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserReward' AND policyname = 'Users can insert own rewards') THEN
        CREATE POLICY "Users can insert own rewards" ON "public"."UserReward"
        FOR INSERT WITH CHECK (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can update their own rewards
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserReward' AND policyname = 'Users can update own rewards') THEN
        CREATE POLICY "Users can update own rewards" ON "public"."UserReward"
        FOR UPDATE USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can delete their own rewards
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserReward' AND policyname = 'Users can delete own rewards') THEN
        CREATE POLICY "Users can delete own rewards" ON "public"."UserReward"
        FOR DELETE USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;
END $$;

-- ============================================================================
-- UserStats Table Policies
-- ============================================================================

DO $$
BEGIN
    -- Policy: Users can only view their own stats
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserStats' AND policyname = 'Users can view own stats') THEN
        CREATE POLICY "Users can view own stats" ON "public"."UserStats"
        FOR SELECT USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can insert their own stats
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserStats' AND policyname = 'Users can insert own stats') THEN
        CREATE POLICY "Users can insert own stats" ON "public"."UserStats"
        FOR INSERT WITH CHECK (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can update their own stats
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserStats' AND policyname = 'Users can update own stats') THEN
        CREATE POLICY "Users can update own stats" ON "public"."UserStats"
        FOR UPDATE USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can delete their own stats
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'UserStats' AND policyname = 'Users can delete own stats') THEN
        CREATE POLICY "Users can delete own stats" ON "public"."UserStats"
        FOR DELETE USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;
END $$;

-- ============================================================================
-- _prisma_migrations Table Policies
-- ============================================================================

DO $$
BEGIN
    -- Policy: Only authenticated users can view migrations (for debugging)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '_prisma_migrations' AND policyname = 'Authenticated users can view migrations') THEN
        CREATE POLICY "Authenticated users can view migrations" ON "public"."_prisma_migrations"
        FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    -- Policy: Only service role can modify migrations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '_prisma_migrations' AND policyname = 'Service role can modify migrations') THEN
        CREATE POLICY "Service role can modify migrations" ON "public"."_prisma_migrations"
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- ============================================================================
-- Additional Security Policies for User Table
-- ============================================================================

DO $$
BEGIN
    -- Policy: Users can view their own profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'User' AND policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON "public"."User"
        FOR SELECT USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can update their own profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'User' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON "public"."User"
        FOR UPDATE USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Public can view basic user info (for social features)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'User' AND policyname = 'Public can view basic user info') THEN
        CREATE POLICY "Public can view basic user info" ON "public"."User"
        FOR SELECT USING (
          -- Allow viewing basic info for public profiles
          "status" = 'Standard' OR "status" = 'Premium'
        );
    END IF;
END $$;

-- ============================================================================
-- PremiumProfile Table Policies
-- ============================================================================

DO $$
BEGIN
    -- Policy: Users can view their own premium profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'PremiumProfile' AND policyname = 'Users can view own premium profile') THEN
        CREATE POLICY "Users can view own premium profile" ON "public"."PremiumProfile"
        FOR SELECT USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Users can update their own premium profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'PremiumProfile' AND policyname = 'Users can update own premium profile') THEN
        CREATE POLICY "Users can update own premium profile" ON "public"."PremiumProfile"
        FOR UPDATE USING (auth.jwt() ->> 'wallet_address' = "walletAddress");
    END IF;

    -- Policy: Public can view active premium profiles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'PremiumProfile' AND policyname = 'Public can view active premium profiles') THEN
        CREATE POLICY "Public can view active premium profiles" ON "public"."PremiumProfile"
        FOR SELECT USING ("isActive" = true);
    END IF;
END $$;

-- ============================================================================
-- Preference Table Policies
-- ============================================================================

DO $$
BEGIN
    -- Policy: Users can view their own preferences
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Preference' AND policyname = 'Users can view own preferences') THEN
        CREATE POLICY "Users can view own preferences" ON "public"."Preference"
        FOR SELECT USING (auth.jwt() ->> 'wallet_address' = "accountAddress");
    END IF;

    -- Policy: Users can update their own preferences
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Preference' AND policyname = 'Users can update own preferences') THEN
        CREATE POLICY "Users can update own preferences" ON "public"."Preference"
        FOR UPDATE USING (auth.jwt() ->> 'wallet_address' = "accountAddress");
    END IF;

    -- Policy: Users can insert their own preferences
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Preference' AND policyname = 'Users can insert own preferences') THEN
        CREATE POLICY "Users can insert own preferences" ON "public"."Preference"
        FOR INSERT WITH CHECK (auth.jwt() ->> 'wallet_address' = "accountAddress");
    END IF;
END $$;
