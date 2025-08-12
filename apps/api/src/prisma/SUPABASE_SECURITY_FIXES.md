# Supabase Security Fixes

This document addresses the Supabase security linting issues found in your application.

## Issues to Fix

### 1. Auth OTP Long Expiry (WARN)
**Issue**: OTP expiry is set to more than an hour
**Risk**: Longer OTP expiry increases security risk

### 2. RLS Enabled No Policy (INFO)
**Issue**: Row Level Security (RLS) is enabled on 7 tables but no policies exist
**Risk**: RLS is enabled but not actually protecting data

### 3. Auth RLS Initialization Plan (WARN) - Performance
**Issue**: `auth.<function>()` calls are re-evaluated for each row
**Risk**: Suboptimal query performance at scale

### 4. Multiple Permissive Policies (WARN) - Performance
**Issue**: Multiple policies for same role/action combinations
**Risk**: Each policy must be executed for every query

## Solutions

### Fix 1: Reduce OTP Expiry Time

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Find the **Email Auth** section
4. Reduce the **OTP Expiry** setting to **less than 1 hour** (recommended: 15-30 minutes)
5. Save the changes

### Fix 2: Apply Optimized RLS Policies

#### Step 1: Apply Basic Policies (if not done already)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `rls-policies.sql` into the editor
4. Execute the SQL script
5. Verify policies are created in **Database** → **Tables** → **Policies**

#### Step 2: Apply Performance Optimizations

1. Copy and paste the contents of `rls-policies-optimized.sql` into the editor
2. Execute the SQL script
3. This will replace existing policies with optimized versions

#### Alternative: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push --include-all
```

#### Alternative: Using Database Connection

```bash
# Connect to your database and run the SQL file
psql "your-database-connection-string" -f rls-policies-optimized.sql
```

## Policy Overview

The RLS policies implement the following security model:

### User-Specific Data Protection
- **UserCoin**: Users can only access their own coins
- **UserNotification**: Users can only access their own notifications
- **UserPreferences**: Users can only access their own preferences
- **UserQuest**: Users can only access their own quests
- **UserReward**: Users can only access their own rewards
- **UserStats**: Users can only access their own stats

### Public Data Access
- **User**: Public can view basic user info for social features
- **PremiumProfile**: Public can view active premium profiles

### System Tables
- **_prisma_migrations**: Restricted access for debugging and service operations

## Performance Optimizations

### Auth Function Optimization
- **Before**: `auth.jwt() ->> 'wallet_address'` (re-evaluated per row)
- **After**: `(SELECT auth.jwt() ->> 'wallet_address')` (evaluated once per query)

### Policy Consolidation
- **Before**: Multiple separate policies for same role/action
- **After**: Single consolidated policies using OR conditions

### Benefits
1. **Faster Queries**: Auth functions evaluated once instead of per row
2. **Reduced Overhead**: Fewer policies to check per query
3. **Better Scalability**: Performance improvements at scale
4. **Same Security**: No compromise on security model

## Security Benefits

1. **Data Isolation**: Users can only access their own data
2. **Privacy Protection**: Sensitive user information is protected
3. **Social Features**: Public data remains accessible for social interactions
4. **System Security**: Migration tables are protected from unauthorized access
5. **Performance**: Optimized for scale without security compromise

## Verification

After applying the policies, you can verify they're working:

1. Check Supabase Dashboard → **Database** → **Tables** → **Policies**
2. Run the Supabase linter again to confirm issues are resolved
3. Test your application to ensure functionality is maintained

## Customization

You may need to adjust the policies based on your specific requirements:

- **Admin Access**: Add policies for admin users if needed
- **Public Data**: Modify which user data is publicly accessible
- **Service Operations**: Adjust policies for background jobs or API operations

## Important Notes

- These policies assume your JWT contains a `wallet_address` claim
- Test thoroughly in development before applying to production
- Monitor application performance after applying policies
- Consider adding indexes for frequently queried columns

## Troubleshooting

### Common Issues

1. **Policy Conflicts**: Ensure policies don't conflict with existing ones
2. **JWT Claims**: Verify your JWT contains the expected `wallet_address` claim
3. **Performance**: Monitor query performance after applying policies

### Testing Policies

```sql
-- Test a policy (replace with actual wallet address)
SELECT * FROM "UserCoin" WHERE "walletAddress" = '0x...';
```

### Removing Policies (if needed)

```sql
-- Example: Remove all policies from a table
DROP POLICY IF EXISTS "Users can view own coins" ON "public"."UserCoin";
DROP POLICY IF EXISTS "Users can insert own coins" ON "public"."UserCoin";
-- ... repeat for other policies
```
