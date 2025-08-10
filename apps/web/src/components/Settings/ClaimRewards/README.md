# Claim Rewards Page

This page allows users to claim their rewards from different smart contracts on the Arbitrum network.

## Features

- **Referral Rewards**: Claim rewards from the referral contract
- **Balanced Game Vault Rewards**: Claim rewards from the balanced game vault contract
- **Unbalanced Game Vault Rewards**: Claim rewards from the unbalanced game vault contract
- **Unbalanced Node Info**: Display information about unbalanced node payments

## Contract Addresses

The component uses contract addresses defined in `@/lib/constants.ts`:

- **Referral Contract**: `0x3bC03e9793d2E67298fb30871a08050414757Ca7`
- **Balanced Game Vault Contract**: `0x65f83111e525C8a577C90298377e56E72C24aCb2`
- **Unbalanced Game Vault Contract**: `0x10E7F9feB9096DCBb94d59D6874b07657c965981`

These addresses are configured for the Arbitrum mainnet.

## Route

The page is accessible at `/settings/claim-rewards`

## Dependencies

- `wagmi` - For blockchain interactions
- `viem` - For Ethereum utilities
- `react-hot-toast` - For notifications

## Smart Contract Functions Used

### Referral Contract
- `getBalanceOfPlayer()` - Get player's referral balance
- `withdraw()` - Claim referral rewards
- `getUnbalancedPlayerNode(address)` - Get unbalanced node information

### Balanced Game Vault Contract
- `playerBalance()` - Get player's balanced game vault balance
- `claimReward()` - Claim balanced game vault rewards

### Unbalanced Game Vault Contract
- `playerBalance()` - Get player's unbalanced game vault balance
- `claimReward()` - Claim unbalanced game vault rewards

## Important Implementation Notes

### Decimal Handling
The components use `formatUnits(balance, 6)` instead of `formatEther(balance)` because:
- **USDT uses 6 decimals** (not 18 like ETH)
- `formatEther` assumes 18 decimals and would display incorrect values
- `formatUnits(balance, 6)` correctly converts the raw balance to USDT units

### Example Calculation
- Raw balance: `685714` (from smart contract)
- Correct conversion: `685714 / 10^6 = 0.685714 USDT`
- Incorrect conversion: `685714 / 10^18 = 0.000000000000685714` (displays as 0.0000) 