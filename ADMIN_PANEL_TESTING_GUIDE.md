# Smart Contract Control Panel - Testing Guide

## 🚀 Quick Start

1. **Start the Admin Panel**: The admin panel should be running on `http://localhost:4784/admin`
2. **Connect Wallet**: Make sure you have a wallet connected with admin privileges
3. **Test Each Function**: Follow the systematic testing guide below

## 📋 Pre-Testing Checklist

- [ ] Admin panel is accessible at `http://localhost:4784/admin`
- [ ] Wallet is connected (MetaMask, WalletConnect, etc.)
- [ ] Connected wallet has admin privileges on the contracts
- [ ] You're on the correct network (Arbitrum One for mainnet contracts)

## 🧪 Systematic Function Testing

### Module 1: Referral Contract Management

#### 1.1 Registration & Fee Management
**Location**: First tab → "Registration & Fee Management" section

**Test Functions**:
1. **setRegistryAmount**
   - [ ] Click "Configure Fees"
   - [ ] Enter a valid amount in "Registry Amount" field
   - [ ] Click "Submit"
   - [ ] Verify transaction appears in wallet
   - [ ] Confirm transaction

2. **setFirstFeePercent**
   - [ ] Enter a percentage (1-100) in "First Fee Percent" field
   - [ ] Click "Submit"
   - [ ] Verify transaction

3. **setSecondFeePercent**
   - [ ] Enter a percentage in "Second Fee Percent" field
   - [ ] Click "Submit"
   - [ ] Verify transaction

4. **setThirdFeePercent**
   - [ ] Enter a percentage in "Third Fee Percent" field
   - [ ] Click "Submit"
   - [ ] Verify transaction

5. **setFirstFeeRange**
   - [ ] Enter a range value in "First Fee Range" field
   - [ ] Click "Submit"
   - [ ] Verify transaction

6. **setSecondFeeRange**
   - [ ] Enter a range value in "Second Fee Range" field
   - [ ] Click "Submit"
   - [ ] Verify transaction

7. **setMaxDailyPayment**
   - [ ] Enter a maximum daily payment amount
   - [ ] Click "Submit"
   - [ ] Verify transaction

8. **setMaxValueOfPoint**
   - [ ] Enter a maximum point value
   - [ ] Click "Submit"
   - [ ] Verify transaction

#### 1.2 Vault Fund Distribution
**Location**: Second tab → "Vault Fund Distribution" section

**Test Function**:
1. **setVaultPercentages**
   - [ ] Click "Set Distribution"
   - [ ] Enter percentages for all 5 vaults (should total 100%):
     - Referral: 20
     - Game: 30
     - Dev: 20
     - VIP: 15
     - Unbalanced: 15
   - [ ] Click "Submit"
   - [ ] Verify transaction

#### 1.3 Reward Calculation
**Location**: Third tab → "Reward Calculation" section

**Test Functions**:
1. **rewardCalculation**
   - [ ] Click "Calculate Rewards"
   - [ ] Confirm in modal
   - [ ] Verify transaction

2. **unbalancedRewardCalculation**
   - [ ] Click "Calculate Unbalanced"
   - [ ] Confirm in modal
   - [ ] Verify transaction

### Module 2: Game Vault Contract Management

#### 2.1 Batch Reward Distribution
**Location**: Fourth tab → "Batch Reward Distribution" section

**Test Function**:
1. **playersReward**
   - [ ] Click "Distribute Rewards"
   - [ ] Add multiple player addresses and amounts:
     - Address: `0x1234567890123456789012345678901234567890`, Amount: `1000000000000000000`
     - Address: `0x0987654321098765432109876543210987654321`, Amount: `2000000000000000000`
   - [ ] Click "Submit"
   - [ ] Verify transaction

#### 2.2 Batch Claim Rewards
**Location**: Fourth tab → "Batch Claim Rewards" section

**Test Function**:
1. **claimRewardAdminList**
   - [ ] Click "Batch Claim"
   - [ ] Add player addresses to claim for:
     - `0x1234567890123456789012345678901234567890`
     - `0x0987654321098765432109876543210987654321`
   - [ ] Click "Submit"
   - [ ] Verify transaction

### Module 3: Access Control Management

#### 3.1 Grant Roles
**Location**: Fifth tab → "Access Control" section

**Test Functions**:
1. **grantRole (Referral Contract)**
   - [ ] Select "Referral Contract"
   - [ ] Select "Default Admin Role" or "Keeper Role"
   - [ ] Enter target address: `0x1234567890123456789012345678901234567890`
   - [ ] Click "Grant Role"
   - [ ] Verify transaction

2. **grantRole (Game Vault Contract)**
   - [ ] Select "Game Vault Contract"
   - [ ] Select role
   - [ ] Enter target address
   - [ ] Click "Grant Role"
   - [ ] Verify transaction

#### 3.2 Revoke Roles
**Location**: Fifth tab → "Access Control" section

**Test Functions**:
1. **revokeRole (Referral Contract)**
   - [ ] Select "Referral Contract"
   - [ ] Select role to revoke
   - [ ] Enter target address
   - [ ] Click "Revoke Role"
   - [ ] Verify transaction

2. **revokeRole (Game Vault Contract)**
   - [ ] Select "Game Vault Contract"
   - [ ] Select role to revoke
   - [ ] Enter target address
   - [ ] Click "Revoke Role"
   - [ ] Verify transaction

### Module 4: Data Monitoring (Read-Only)

#### 4.1 Referral Contract Data
**Location**: Sixth tab → "Data Monitor" section

**Test Functions**:
1. **getPlayerNodeAdmin**
   - [ ] Enter a player address: `0x1234567890123456789012345678901234567890`
   - [ ] Click "Get Player Node"
   - [ ] Verify data is displayed

2. **getUnbalancedPlayerNode**
   - [ ] Enter a player address
   - [ ] Click "Get Unbalanced Node"
   - [ ] Verify data is displayed

#### 4.2 Game Vault Contract Data
**Location**: Sixth tab → "Data Monitor" section

**Test Functions**:
1. **playerBalanceAdmin2**
   - [ ] Select "Game Vault Contract"
   - [ ] Enter a player address
   - [ ] Click "Get Player Balance"
   - [ ] Verify balance is displayed

## 🔍 Expected Behaviors

### ✅ Success Indicators
- Transaction appears in wallet for signing
- Toast notification shows "submitted successfully"
- Modal closes after submission
- Form fields reset to empty
- No console errors

### ❌ Error Indicators
- Toast notification shows error message
- Console shows error details
- Transaction fails in wallet
- Modal stays open with error

## 🐛 Common Issues & Solutions

### Issue: "Cannot read properties of undefined (reading 'then')"
**Solution**: This was fixed by removing `.then()` and `.catch()` from writeContract calls

### Issue: "Contract not found"
**Solution**: Verify contract addresses in `src/lib/contracts.ts` are correct

### Issue: "Insufficient permissions"
**Solution**: Ensure connected wallet has admin role on the contracts

### Issue: "Invalid address format"
**Solution**: Ensure addresses are valid Ethereum addresses (0x...)

### Issue: "Transaction failed"
**Solution**: Check gas fees, network connection, and contract state

## 📊 Testing Results Template

```
Date: _______________
Tester: _______________
Wallet Address: _______________

### Referral Contract Tests
- [ ] setRegistryAmount: PASS/FAIL
- [ ] setFirstFeePercent: PASS/FAIL
- [ ] setSecondFeePercent: PASS/FAIL
- [ ] setThirdFeePercent: PASS/FAIL
- [ ] setFirstFeeRange: PASS/FAIL
- [ ] setSecondFeeRange: PASS/FAIL
- [ ] setMaxDailyPayment: PASS/FAIL
- [ ] setMaxValueOfPoint: PASS/FAIL
- [ ] setVaultPercentages: PASS/FAIL
- [ ] rewardCalculation: PASS/FAIL
- [ ] unbalancedRewardCalculation: PASS/FAIL

### Game Vault Contract Tests
- [ ] playersReward: PASS/FAIL
- [ ] claimRewardAdminList: PASS/FAIL

### Access Control Tests
- [ ] grantRole (Referral): PASS/FAIL
- [ ] grantRole (Game Vault): PASS/FAIL
- [ ] revokeRole (Referral): PASS/FAIL
- [ ] revokeRole (Game Vault): PASS/FAIL

### Data Monitoring Tests
- [ ] getPlayerNodeAdmin: PASS/FAIL
- [ ] getUnbalancedPlayerNode: PASS/FAIL
- [ ] playerBalanceAdmin2: PASS/FAIL

### Overall Assessment
- [ ] All functions working correctly
- [ ] UI responsive and user-friendly
- [ ] Error handling working
- [ ] Ready for production use

Notes: _______________
```

## 🚨 Security Notes

1. **Admin Privileges**: Only wallets with admin roles can execute these functions
2. **Test Environment**: Consider testing on testnet first
3. **Gas Fees**: Be aware of gas costs for each transaction
4. **Backup**: Keep backup of current contract settings before making changes

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify wallet connection and network
3. Ensure contract addresses are correct
4. Check if wallet has required permissions 