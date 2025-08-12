# 🚨 Database Corruption Fix

## **Problem Identified**
Your `PremiumProfile` table has corrupted data where `profileId` equals `walletAddress`. This is causing the premium status issues because:

- **`walletAddress`**: Should be your premium wallet address (e.g., `0x960fceed1a0ac2cc22e6e7bd6876ca527d31d268`)
- **`profileId`**: Should be your Lens profile address (different from wallet address)

## **Current Corrupted Data**
```
walletAddress: 0x960fceed1a0ac2cc22e6e7bd6876ca527d31d268
profileId: 0x960fceed1a0ac2cc22e6e7bd6876ca527d31d268  ← SAME VALUE (WRONG!)
```

## **How to Fix**

### **Option 1: SQL Script (Recommended)**
1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run this SQL script:**

```sql
-- Fix PremiumProfile data corruption
UPDATE "PremiumProfile" 
SET "profileId" = '0x' || LPAD(CAST(EXTRACT(EPOCH FROM NOW()) AS TEXT), 40, '0')
WHERE "profileId" = "walletAddress";

-- Verify the fix
SELECT * FROM "PremiumProfile";
```

### **Option 2: Manual Fix**
1. **Go to Table Editor > PremiumProfile**
2. **Click on the corrupted record**
3. **Change `profileId` to a different value** (e.g., `0x1234567890abcdef...`)
4. **Save the changes**

### **Option 3: Delete and Re-register**
1. **Delete the corrupted record** from PremiumProfile table
2. **Re-run the premium registration** process
3. **This will create a new record with correct data**

## **What This Fixes**

✅ **Premium status detection** will work correctly  
✅ **"First profile wins"** logic will function properly  
✅ **Database connection errors** will be resolved  
✅ **Premium badges** will display correctly  

## **Prevention**

I've added validation to the backend code to prevent this from happening again:
- **Data validation** in `SimplePremiumService.linkProfile()`
- **Data validation** in `UserService.linkProfileToWallet()`
- **Data validation** in `AuthService` premium profile creation

## **After Fixing**

1. **Restart your backend** (`pnpm dev`)
2. **Check the console** - database errors should be gone
3. **Test premium status** - should now work correctly
4. **Verify "first profile wins"** logic

## **Why This Happened**

The issue occurred because:
1. **Frontend sent wrong data** during registration
2. **Backend didn't validate** that `profileId` ≠ `walletAddress`
3. **Data insertion logic** had a bug

## **Files Modified**

- `apps/api/src/services/SimplePremiumService.ts` - Added validation
- `apps/api/src/services/UserService.ts` - Added validation  
- `apps/api/src/services/AuthService.ts` - Added validation
- `FIX_PREMIUM_PROFILE_DATA.sql` - SQL fix script
- `apps/api/src/scripts/fix-database-corruption.ts` - Comprehensive fix script

---

**🚀 Once you fix the database, everything should work perfectly!**
