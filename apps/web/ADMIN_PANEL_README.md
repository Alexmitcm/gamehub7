# Smart Contract Control Panel

A professional, high-utility admin interface for managing blockchain smart contracts. This panel provides direct on-chain interaction capabilities for both referral and game vault contracts.

## 🚀 Features

### Referral Contract Management
- **Registration & Fee Management**: Configure registration costs, fee percentages, and payment limits
- **Vault Fund Distribution**: Set how incoming funds are distributed across different vaults
- **Reward Calculation**: Trigger reward calculation processes
- **Unbalanced Reward Calculation**: Process unbalanced reward calculations

### Game Vault Contract Management
- **Batch Reward Distribution**: Distribute rewards to multiple players at once
- **Batch Claim Rewards**: Claim rewards on behalf of multiple players
- **Player Balance Monitoring**: Check individual player balances

### Access Control Management
- **Role Management**: Grant and revoke administrative roles for both contracts
- **Multi-Contract Support**: Manage roles for referral and game vault contracts separately
- **Security Features**: Confirmation modals for critical actions

### Data Monitoring
- **Player Node Data**: View detailed player node information from referral contract
- **Unbalanced Node Data**: Monitor unbalanced player nodes
- **Balance Queries**: Check player balances in game vault contract
- **Real-time Data**: Direct blockchain queries for up-to-date information

## 🛠️ Setup & Configuration

### 1. Contract Addresses
Update the contract addresses in `src/lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  REFERRAL: "0x...", // Your deployed referral contract address
  GAME_VAULT: "0x...", // Your deployed game vault contract address
  TETHER: "0x..." // Your deployed tether contract address
} as const;
```

### 2. Network Configuration
Configure your network settings in `src/lib/contracts.ts`:

```typescript
export const NETWORK_CONFIG = {
  CHAIN_ID: 1, // Your target network chain ID
  RPC_URL: "https://your-rpc-url", // Your RPC endpoint
  EXPLORER_URL: "https://your-explorer-url" // Your block explorer
} as const;
```

### 3. Running the Admin Panel

#### Development Mode
```bash
# Run the main application on port 4783
npm run dev

# Run the admin panel on port 4784
npm run dev:admin
```

#### Production Mode
```bash
# Build the application
npm run build

# Start the main application
npm run start

# Start the admin panel
npm run start:admin
```

## 🔐 Security Considerations

### Access Control
- The admin panel requires wallet connection
- Only addresses with appropriate roles can execute administrative functions
- All critical actions require confirmation

### Role Management
- **Default Admin Role**: Full administrative access
- **Keeper Role**: Limited administrative access
- Roles can be granted and revoked through the interface

### Transaction Safety
- All transactions require wallet signature
- Confirmation modals for destructive actions
- Input validation for all parameters

## 📋 Usage Guide

### Referral Contract Management

#### 1. Fee Configuration
1. Navigate to "Referral Contract" tab
2. Click "Configure Fees"
3. Enter values for:
   - Registry Amount (wei)
   - Fee Percentages (0-100)
   - Fee Ranges (wei)
   - Payment Limits (wei)
4. Click "Update Settings"

#### 2. Vault Distribution
1. Click "Set Distribution"
2. Enter percentages for each vault:
   - Referral Vault
   - Game Vault
   - Dev Vault
   - VIP Vault
   - Unbalanced Vault
3. Ensure total equals 100%
4. Click "Update Distribution"

#### 3. Reward Calculations
1. Click "Calculate Rewards" to trigger standard reward calculation
2. Click "Calculate Unbalanced" to process unbalanced rewards
3. Confirm the action in the modal

### Game Vault Contract Management

#### 1. Batch Reward Distribution
1. Navigate to "Game Vault Contract" tab
2. Click "Distribute Rewards"
3. Add player addresses and corresponding balances
4. Review the list and click "Distribute Rewards"

#### 2. Batch Claim Rewards
1. Click "Batch Claim"
2. Add player addresses to claim for
3. Review the list and click "Claim Rewards"

### Access Control Management

#### 1. Granting Roles
1. Navigate to "Access Control" tab
2. Select the target contract
3. Click "Grant Role"
4. Choose the role type
5. Enter the target address
6. Click "Grant Role"

#### 2. Revoking Roles
1. Select the target contract
2. Click "Revoke Role"
3. Choose the role type
4. Enter the target address
5. Confirm the action

### Data Monitoring

#### 1. Player Node Data
1. Navigate to "Data Monitor" tab
2. Select "Referral Contract Data"
3. Enter a player address
4. Click "Get Player Node"

#### 2. Player Balance
1. Select "Game Vault Contract Data"
2. Enter a player address
3. Click "Get Player Balance"

## 🔧 Technical Architecture

### Direct On-Chain Interaction
- Uses wagmi/viem for blockchain interaction
- No backend required for contract operations
- Wallet signature for all transactions

### Component Structure
```
src/components/Admin/
├── SmartContractControlPanel.tsx    # Main admin interface
├── ReferralContractManager.tsx      # Referral contract management
├── GameVaultContractManager.tsx     # Game vault contract management
├── AccessControlManager.tsx         # Role management
├── DataMonitor.tsx                  # Data querying
└── index.tsx                        # Entry point
```

### Contract Integration
- ABI files: `src/abi/referral.json`, `src/abi/gameVault.json`
- Contract addresses: `src/lib/contracts.ts`
- Network configuration: `src/lib/contracts.ts`

## 🚨 Important Notes

1. **Contract Addresses**: Always verify contract addresses before deployment
2. **Role Permissions**: Ensure your wallet has the necessary roles
3. **Network Selection**: Make sure you're connected to the correct network
4. **Gas Fees**: Be aware of gas costs for transactions
5. **Testing**: Test all functions on testnet before mainnet

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to execute transaction"**
   - Check wallet connection
   - Verify network selection
   - Ensure sufficient gas fees
   - Confirm role permissions

2. **"Invalid address"**
   - Verify address format (0x...)
   - Check for typos
   - Ensure address is on correct network

3. **"Insufficient permissions"**
   - Check if wallet has required roles
   - Verify contract ownership
   - Contact contract administrator

### Support
For technical support or questions about the admin panel, please refer to the project documentation or contact the development team.

## 📄 License

This admin panel is part of the Hey social media platform and follows the same licensing terms. 