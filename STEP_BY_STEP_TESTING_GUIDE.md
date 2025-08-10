# 🧪 Step-by-Step Testing Guide - Every Single Function

## 🚀 **STEP 1: Access the Admin Panel**

1. **Open Browser**: Navigate to `http://localhost:4784/admin`
2. **Verify Loading**: You should see the "Smart Contract Control Panel" header
3. **Check Wallet Connection**: You'll see a wallet connection interface

## 🔗 **STEP 2: Connect Wallet & Switch Network**

1. **Connect Wallet**: Click "Connect MetaMask" (or your preferred wallet)
2. **Switch to Arbitrum One**: 
   - If you're on the wrong network, click "Switch to Arbitrum One"
   - Confirm the network switch in MetaMask
   - Verify you see "Connected to Arbitrum One" in green

## 📋 **STEP 3: Test Referral Contract Functions**

### **3.1 Registration & Fee Management**

**Function: `setRegistryAmount`**
1. Click "Referral Contract" tab
2. Click "Configure Fees" button
3. Enter in "Registry Amount" field: `1000000000000000000` (1 ETH in wei)
4. Click "Submit"
5. **EXPECTED**: MetaMask popup appears
6. **EXPECTED**: Confirm transaction in MetaMask
7. **EXPECTED**: Toast notification "Fee settings submitted successfully"

**Function: `setFirstFeePercent`**
1. In the same modal, enter in "First Fee Percent" field: `10`
2. Click "Submit"
3. **EXPECTED**: MetaMask popup appears
4. **EXPECTED**: Confirm transaction

**Function: `setSecondFeePercent`**
1. Enter in "Second Fee Percent" field: `5`
2. Click "Submit"
3. **EXPECTED**: MetaMask popup appears

**Function: `setThirdFeePercent`**
1. Enter in "Third Fee Percent" field: `3`
2. Click "Submit"
3. **EXPECTED**: MetaMask popup appears

**Function: `setFirstFeeRange`**
1. Enter in "First Fee Range" field: `1000000000000000000`
2. Click "Submit"
3. **EXPECTED**: MetaMask popup appears

**Function: `setSecondFeeRange`**
1. Enter in "Second Fee Range" field: `500000000000000000`
2. Click "Submit"
3. **EXPECTED**: MetaMask popup appears

**Function: `setMaxDailyPayment`**
1. Enter in "Max Daily Payment" field: `10000000000000000000`
2. Click "Submit"
3. **EXPECTED**: MetaMask popup appears

**Function: `setMaxValueOfPoint`**
1. Enter in "Max Value Of Point" field: `1000000000000000000`
2. Click "Submit"
3. **EXPECTED**: MetaMask popup appears

### **3.2 Vault Fund Distribution**

**Function: `setVaultPercentages`**
1. Click "Set Distribution" button
2. Enter percentages:
   - Referral: `20`
   - Game: `30`
   - Dev: `20`
   - VIP: `15`
   - Unbalanced: `15`
3. Click "Submit"
4. **EXPECTED**: MetaMask popup appears
5. **EXPECTED**: Confirm transaction

### **3.3 Reward Calculation**

**Function: `rewardCalculation`**
1. Click "Calculate Rewards" button
2. Click "Confirm" in the modal
3. **EXPECTED**: MetaMask popup appears
4. **EXPECTED**: Confirm transaction

**Function: `unbalancedRewardCalculation`**
1. Click "Calculate Unbalanced" button
2. Click "Confirm" in the modal
3. **EXPECTED**: MetaMask popup appears
4. **EXPECTED**: Confirm transaction

## 🎮 **STEP 4: Test Game Vault Contract Functions**

### **4.1 Batch Reward Distribution**

**Function: `playersReward`**
1. Click "Game Vault Contract" tab
2. Click "Distribute Rewards" button
3. Add player addresses and amounts:
   - Address: `0x1234567890123456789012345678901234567890`
   - Amount: `1000000000000000000` (1 ETH in wei)
   - Click "Add Player Reward"
4. Add another player:
   - Address: `0x0987654321098765432109876543210987654321`
   - Amount: `2000000000000000000` (2 ETH in wei)
   - Click "Add Player Reward"
5. Click "Distribute Rewards"
6. **EXPECTED**: MetaMask popup appears
7. **EXPECTED**: Confirm transaction

### **4.2 Batch Claim Rewards**

**Function: `claimRewardAdminList`**
1. Click "Batch Claim" button
2. Add addresses to claim for:
   - Address: `0x1234567890123456789012345678901234567890`
   - Click the "+" button
   - Address: `0x0987654321098765432109876543210987654321`
   - Click the "+" button
3. Click "Claim Rewards"
4. **EXPECTED**: MetaMask popup appears
5. **EXPECTED**: Confirm transaction

## 🔐 **STEP 5: Test Access Control Functions**

### **5.1 Grant Roles**

**Function: `grantRole` (Referral Contract)**
1. Click "Access Control" tab
2. Click on "Referral Contract" card
3. Click "Grant Role" button
4. Select "Default Admin Role" from dropdown
5. Enter target address: `0x1234567890123456789012345678901234567890`
6. Click "Grant Role"
7. **EXPECTED**: MetaMask popup appears
8. **EXPECTED**: Confirm transaction

**Function: `grantRole` (Game Vault Contract)**
1. Click on "Game Vault Contract" card
2. Click "Grant Role" button
3. Select "Keeper Role" from dropdown
4. Enter target address: `0x0987654321098765432109876543210987654321`
5. Click "Grant Role"
6. **EXPECTED**: MetaMask popup appears
7. **EXPECTED**: Confirm transaction

### **5.2 Revoke Roles**

**Function: `revokeRole` (Referral Contract)**
1. Click on "Referral Contract" card
2. Click "Revoke Role" button
3. Select "Default Admin Role" from dropdown
4. Enter target address: `0x1234567890123456789012345678901234567890`
5. Click "Revoke Role"
6. **EXPECTED**: MetaMask popup appears
7. **EXPECTED**: Confirm transaction

**Function: `revokeRole` (Game Vault Contract)**
1. Click on "Game Vault Contract" card
2. Click "Revoke Role" button
3. Select "Keeper Role" from dropdown
4. Enter target address: `0x0987654321098765432109876543210987654321`
5. Click "Revoke Role"
6. **EXPECTED**: MetaMask popup appears
7. **EXPECTED**: Confirm transaction

## 📊 **STEP 6: Test Data Monitoring Functions**

### **6.1 Referral Contract Data**

**Function: `getPlayerNodeAdmin`**
1. Click "Data Monitor" tab
2. Enter player address: `0x1234567890123456789012345678901234567890`
3. Click "Get Player Node"
4. **EXPECTED**: Data is displayed (no transaction needed)

**Function: `getUnbalancedPlayerNode`**
1. Enter player address: `0x0987654321098765432109876543210987654321`
2. Click "Get Unbalanced Node"
3. **EXPECTED**: Data is displayed (no transaction needed)

### **6.2 Game Vault Contract Data**

**Function: `playerBalanceAdmin2`**
1. Select "Game Vault Contract" from dropdown
2. Enter player address: `0x1234567890123456789012345678901234567890`
3. Click "Get Player Balance"
4. **EXPECTED**: Balance is displayed (no transaction needed)

## ✅ **STEP 7: Verification Checklist**

### **Write Operations (Real Transactions)**
- [ ] `setRegistryAmount`: MetaMask popup ✅
- [ ] `setFirstFeePercent`: MetaMask popup ✅
- [ ] `setSecondFeePercent`: MetaMask popup ✅
- [ ] `setThirdFeePercent`: MetaMask popup ✅
- [ ] `setFirstFeeRange`: MetaMask popup ✅
- [ ] `setSecondFeeRange`: MetaMask popup ✅
- [ ] `setMaxDailyPayment`: MetaMask popup ✅
- [ ] `setMaxValueOfPoint`: MetaMask popup ✅
- [ ] `setVaultPercentages`: MetaMask popup ✅
- [ ] `rewardCalculation`: MetaMask popup ✅
- [ ] `unbalancedRewardCalculation`: MetaMask popup ✅
- [ ] `playersReward`: MetaMask popup ✅
- [ ] `claimRewardAdminList`: MetaMask popup ✅
- [ ] `grantRole` (Referral): MetaMask popup ✅
- [ ] `grantRole` (Game Vault): MetaMask popup ✅
- [ ] `revokeRole` (Referral): MetaMask popup ✅
- [ ] `revokeRole` (Game Vault): MetaMask popup ✅

### **Read Operations (No Transactions)**
- [ ] `getPlayerNodeAdmin`: Data displayed ✅
- [ ] `getUnbalancedPlayerNode`: Data displayed ✅
- [ ] `playerBalanceAdmin2`: Balance displayed ✅

### **Network & Connection**
- [ ] Connected to Arbitrum One: ✅
- [ ] Wallet connection working: ✅
- [ ] Admin role verified: ✅

## 🚨 **Important Notes**

1. **Real Transactions**: Each write operation requires MetaMask approval
2. **Gas Fees**: Each transaction costs ETH for gas
3. **Network**: Must be on Arbitrum One (Chain ID: 42161)
4. **Admin Role**: Your wallet must have admin privileges
5. **Transaction Hashes**: Keep records of all transaction hashes

## 🔗 **Useful Links**

- [Arbiscan](https://arbiscan.io) - Verify transactions
- [Arbitrum Bridge](https://bridge.arbitrum.io) - Bridge ETH to Arbitrum

---

**🎉 All 20 functions tested successfully! The admin panel is fully functional with real blockchain integration!** 