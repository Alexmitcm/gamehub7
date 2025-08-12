-- Fix RLS Performance Issues
-- Replace auth.<function>() with (select auth.<function>()) for better performance

-- User table policies
DROP POLICY IF EXISTS "Users can insert own user data" ON "public"."User";
CREATE POLICY "Users can insert own user data" ON "public"."User"
FOR INSERT WITH CHECK ((select auth.uid())::text = "walletAddress");

DROP POLICY IF EXISTS "Users can update own user data" ON "public"."User";
CREATE POLICY "Users can update own user data" ON "public"."User"
FOR UPDATE USING ((select auth.uid())::text = "walletAddress");

DROP POLICY IF EXISTS "Users can view own user data" ON "public"."User";
CREATE POLICY "Users can view own user data" ON "public"."User"
FOR SELECT USING ((select auth.uid())::text = "walletAddress");

-- Preference table policies
DROP POLICY IF EXISTS "Users can insert own preferences" ON "public"."Preference";
CREATE POLICY "Users can insert own preferences" ON "public"."Preference"
FOR INSERT WITH CHECK ((select auth.uid())::text = "accountAddress");

DROP POLICY IF EXISTS "Users can update own preferences" ON "public"."Preference";
CREATE POLICY "Users can update own preferences" ON "public"."Preference"
FOR UPDATE USING ((select auth.uid())::text = "accountAddress");

DROP POLICY IF EXISTS "Users can view own preferences" ON "public"."Preference";
CREATE POLICY "Users can view own preferences" ON "public"."Preference"
FOR SELECT USING ((select auth.uid())::text = "accountAddress");

-- PremiumProfile table policies
DROP POLICY IF EXISTS "Users can insert own premium profile" ON "public"."PremiumProfile";
CREATE POLICY "Users can insert own premium profile" ON "public"."PremiumProfile"
FOR INSERT WITH CHECK ((select auth.uid())::text = "walletAddress");

DROP POLICY IF EXISTS "Users can update own premium profile" ON "public"."PremiumProfile";
CREATE POLICY "Users can update own premium profile" ON "public"."PremiumProfile"
FOR UPDATE USING ((select auth.uid())::text = "walletAddress");

DROP POLICY IF EXISTS "Users can view own premium profile" ON "public"."PremiumProfile";
CREATE POLICY "Users can view own premium profile" ON "public"."PremiumProfile"
FOR SELECT USING ((select auth.uid())::text = "walletAddress");
