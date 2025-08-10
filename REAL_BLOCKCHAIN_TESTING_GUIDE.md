# Real Blockchain Integration Testing Guide

## 🎯 What's Fixed

The admin panel now connects to **real smart contracts** on **Arbitrum One** instead of using mock data:

✅ **Real Contract Addresses**: Using actual deployed contract addresses  
✅ **Arbitrum One Network**: Properly configured for Arbitrum One (Chain ID: 42161)  
✅ **Real Wallet Integration**: Direct blockchain interaction via wagmi/viem  
✅ **Network Validation**: Ensures you're connected to the correct network  
✅ **Transaction Signing**: Real transactions that require wallet approval  

## 🚀 Quick Start

1. **Access Admin Panel**: Navigate to `http://localhost:4784/admin`
2. **Connect Wallet**: Use MetaMask, WalletConnect, or injected wallet
3. **Switch to Arbitrum One**: The panel will prompt you to switch networks
4. **Verify Admin Role**: Ensure your wallet has admin privileges on the contracts

## 🔗 Contract Addresses (Arbitrum One)

```typescript
REFERRAL: "0x3bC03e9793d2E67298fb30871a08050414757Ca7"
GAME_VAULT: "0x65f83111e525C8a577C90298377e56E72C24aCb2"
UNBALANCED_GAME_VAULT: "0x10E7F9feB9096DCBb94d59D6874b07657c965981"
TETHER: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
```

## 🧪 Real Function Testing

### Prerequisites
- [ ] MetaMask or compatible wallet installed
- [ ] Wallet connected to Arbitrum One (Chain ID: 42161)
- [ ] Wallet has admin role on the contracts
- [ ] Sufficient ETH for gas fees

### Test Each Function (Real Transactions)

#### 1. Referral Contract Functions

**setRegistryAmount**
- [ ] Navigate to "Referral Contract" tab
- [ ] Click "Configure Fees"
- [ ] Enter amount: `1000000000000000000` (1 ETH in wei)
- [ ] Click "Submit"
- [ ] **REAL TRANSACTION**: MetaMask popup appears
- [ ] Confirm transaction in wallet
- [ ] Wait for confirmation on Arbitrum One

**setFirstFeePercent**
- [ ] Enter percentage: `10`
- [ ] Click "Submit"
- [ ] **REAL TRANSACTION**: MetaMask popup appears
- [ ] Confirm transaction

**setVaultPercentages**
- [ ] Click "Set Distribution"
- [ ] Enter percentages:
  - Referral: `20`
  - Game: `30`
  - Dev: `20`
  - VIP: `15`
  - Unbalanced: `15`
- [ ] Click "Submit"
- [ ] **REAL TRANSACTION**: MetaMask popup appears
- [ ] Confirm transaction

**rewardCalculation**
- [ ] Click "Calculate Rewards"
- [ ] Confirm in modal
- [ ] **REAL TRANSACTION**: MetaMask popup appears
- [ ] Confirm transaction

#### 2. Game Vault Contract Functions

**playersReward (Batch Distribution)**
- [ ] Navigate to "Game Vault Contract" tab
- [ ] Click "Distribute Rewards"
- [ ] Add player addresses and amounts:
  - Address: `0x1234567890123456789012345678901234567890`
  - Amount: `1000000000000000000` (1 ETH in wei)
- [ ] Click "Submit"
- [ ] **REAL TRANSACTION**: MetaMask popup appears
- [ ] Confirm transaction

**claimRewardAdminList (Batch Claim)**
- [ ] Click "Batch Claim"
- [ ] Add addresses to claim for
- [ ] Click "Submit"
- [ ] **REAL TRANSACTION**: MetaMask popup appears
- [ ] Confirm transaction

#### 3. Access Control Functions

**grantRole**
- [ ] Navigate to "Access Control" tab
- [ ] Select contract (Referral or Game Vault)
- [ ] Click "Grant Role"
- [ ] Select role (Default Admin or Keeper)
- [ ] Enter target address
- [ ] Click "Grant Role"
- [ ] **REAL TRANSACTION**: MetaMask popup appears
- [ ] Confirm transaction

**revokeRole**
- [ ] Select contract and role
- [ ] Enter target address
- [ ] Click "Revoke Role"
- [ ] **REAL TRANSACTION**: MetaMask popup appears
- [ ] Confirm transaction

#### 4. Data Monitoring (Read-Only)

**getPlayerNodeAdmin**
- [ ] Navigate to "Data Monitor" tab
- [ ] Enter player address
- [ ] Click "Get Player Node"
- [ ] **READ OPERATION**: No transaction needed
- [ ] Verify data is displayed

**playerBalanceAdmin2**
- [ ] Select "Game Vault Contract"
- [ ] Enter player address
- [ ] Click "Get Player Balance"
- [ ] **READ OPERATION**: No transaction needed
- [ ] Verify balance is displayed

## 🔍 Verification Steps

### Transaction Verification
1. **MetaMask Popup**: Should appear for every write operation
2. **Transaction Hash**: Copy and verify on [Arbiscan](https://arbiscan.io)
3. **Gas Fees**: Confirm you have sufficient ETH for gas
4. **Network**: Ensure you're on Arbitrum One (Chain ID: 42161)

### Success Indicators
- ✅ MetaMask popup appears for transactions
- ✅ Transaction hash is generated
- ✅ Transaction confirms on Arbitrum One
- ✅ Toast notification shows success
- ✅ Contract state changes on blockchain

### Error Indicators
- ❌ "User rejected transaction" (user cancelled)
- ❌ "Insufficient funds" (need more ETH for gas)
- ❌ "Contract not found" (wrong network)
- ❌ "Access denied" (no admin role)

## 🛠️ Troubleshooting

### Issue: "Contract not found"
**Solution**: Ensure you're connected to Arbitrum One (Chain ID: 42161)

### Issue: "Access denied"
**Solution**: Verify your wallet has admin role on the contracts

### Issue: "Insufficient funds"
**Solution**: Add ETH to your wallet for gas fees

### Issue: "User rejected transaction"
**Solution**: User cancelled the transaction in MetaMask

### Issue: "Network not supported"
**Solution**: Add Arbitrum One to MetaMask:
- Network Name: Arbitrum One
- RPC URL: https://arb1.arbitrum.io/rpc
- Chain ID: 42161
- Currency Symbol: ETH

## 📊 Testing Results Template

```
Date: _______________
Tester: _______________
Wallet Address: _______________
Network: Arbitrum One (42161)

### Write Operations (Real Transactions)
- [ ] setRegistryAmount: PASS/FAIL (Tx Hash: ________)
- [ ] setFirstFeePercent: PASS/FAIL (Tx Hash: ________)
- [ ] setVaultPercentages: PASS/FAIL (Tx Hash: ________)
- [ ] rewardCalculation: PASS/FAIL (Tx Hash: ________)
- [ ] playersReward: PASS/FAIL (Tx Hash: ________)
- [ ] claimRewardAdminList: PASS/FAIL (Tx Hash: ________)
- [ ] grantRole: PASS/FAIL (Tx Hash: ________)
- [ ] revokeRole: PASS/FAIL (Tx Hash: ________)

### Read Operations (No Transactions)
- [ ] getPlayerNodeAdmin: PASS/FAIL
- [ ] playerBalanceAdmin2: PASS/FAIL

### Network & Connection
- [ ] Connected to Arbitrum One: PASS/FAIL
- [ ] Wallet connection working: PASS/FAIL
- [ ] Admin role verified: PASS/FAIL

### Overall Assessment
- [ ] All functions working with real blockchain
- [ ] Transactions requiring wallet approval
- [ ] Network validation working
- [ ] Ready for production use

Notes: _______________
```

## 🚨 Important Notes

1. **Real Money**: These are real transactions on Arbitrum One
2. **Gas Fees**: Each transaction requires ETH for gas
3. **Admin Role**: Only wallets with admin privileges can execute functions
4. **Network**: Must be connected to Arbitrum One (not testnet)
5. **Backup**: Keep records of all transaction hashes

## 🔗 Useful Links

- [Arbiscan](https://arbiscan.io) - Arbitrum One block explorer
- [Arbitrum Bridge](https://bridge.arbitrum.io) - Bridge assets to Arbitrum
- [Arbitrum RPC](https://arb1.arbitrum.io/rpc) - Public RPC endpoint

---

**The admin panel is now fully functional with real blockchain integration!** 🎉 