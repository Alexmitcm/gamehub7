# Database Schema Fix

## Problem
The application is returning 500 errors because of a database schema mismatch. The error in the logs shows:

```
ERROR: column PremiumProfile.walletType does not exist
```

## Root Cause
The Prisma schema has been updated to include new columns in the `PremiumProfile` table:
- `walletType` (TEXT, default: 'MetaMask')
- `lensWalletAddress` (TEXT, nullable)
- `registrationTxHash` (TEXT, nullable)

However, these columns don't exist in the production database, causing queries to fail.

## Solution

### Option 1: Run the Database Fix Script (Recommended)

1. **On Railway Dashboard:**
   - Go to your Railway project
   - Navigate to the "Deployments" tab
   - Click on the latest deployment
   - Go to the "Logs" tab
   - Click on the terminal/console

2. **Run the fix script:**
   ```bash
   npm run fix-database
   ```

### Option 2: Manual SQL Execution

If you have direct database access, you can run this SQL:

```sql
-- Add missing columns to PremiumProfile table
ALTER TABLE "PremiumProfile" ADD COLUMN "walletType" TEXT NOT NULL DEFAULT 'MetaMask';
ALTER TABLE "PremiumProfile" ADD COLUMN "lensWalletAddress" TEXT;
ALTER TABLE "PremiumProfile" ADD COLUMN "registrationTxHash" TEXT;

-- Create index on walletType column
CREATE INDEX "PremiumProfile_walletType_idx" ON "PremiumProfile"("walletType");
```

### Option 3: Using Prisma Migrate

If you have database access and want to use Prisma migrations:

```bash
# Generate the migration
npx prisma migrate dev --name add_wallet_type_to_premium_profile --schema src/prisma/schema.prisma

# Deploy the migration
npx prisma migrate deploy --schema src/prisma/schema.prisma
```

## Verification

After applying the fix, the `/auth/sync-lens` endpoint should work correctly and return proper JSON responses instead of 500 errors.

## Files Created

- `scripts/fix-database.js` - Node.js script to fix the database
- `scripts/fix-database.sql` - SQL script for manual execution
- `src/prisma/migrations/20250115000003_add_wallet_type_to_premium_profile/migration.sql` - Prisma migration file

## Notes

- The fix script is idempotent - it can be run multiple times safely
- The script checks if columns exist before adding them
- This fix addresses the immediate 500 error issue
- For future deployments, ensure Prisma migrations are run properly
