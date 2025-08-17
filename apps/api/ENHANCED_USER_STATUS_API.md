# Enhanced User Status System API Documentation

## Overview

This document describes the enhanced user status system that implements the three-tier user status model:
- **Standard**: Users without premium registration
- **Premium**: Users with premium registration and linked profiles
- **OnChainUnlinked**: Users with premium on-chain but no linked profile

## User Status Flow

### 1. Standard User Status
- User has only a Lens profile
- No access to Pro features or referral dashboard
- Must complete premium registration to upgrade

### 2. Premium Registration Process
- Requires MetaMask wallet connection
- Auto-switches to Arbitrum One network
- Creates permanent link between premium wallet and Lens profile

### 3. Premium User Status
- Full access to Pro features
- Can claim rewards using premium wallet
- Profile permanently linked to premium wallet

### 4. OnChainUnlinked Status
- User has premium wallet but no linked profile
- Can link existing profile or create new one
- First profile linked becomes permanently premium

## API Endpoints

### Authentication & User Status

#### POST /api/auth/login-enhanced
Enhanced login with new user status logic.

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "lensProfileId": "0x..." // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "userStatus": "Standard|Premium|OnChainUnlinked",
  "requiresMetaMaskConnection": false,
  "requiresNetworkSwitch": false,
  "linkedProfile": {
    "profileId": "0x...",
    "handle": "username",
    "linkedAt": "2024-01-01T00:00:00Z"
  },
  "premiumWalletAddress": "0x...",
  "lensWalletAddress": "0x..."
}
```

#### POST /api/auth/user-status
Get comprehensive user status.

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "lensProfileId": "0x..." // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userStatus": {
      "status": "Standard|Premium|OnChainUnlinked",
      "walletAddress": "0x...",
      "isPremiumOnChain": false,
      "hasLinkedProfile": false,
      "canLinkProfile": false
    },
    "requiresMetaMaskConnection": true,
    "requiresNetworkSwitch": false,
    "canAccessPremiumFeatures": false,
    "canClaimRewards": false
  }
}
```

#### GET /api/auth/premium-access
Check if user can access premium features.

**Query Parameters:**
- `walletAddress`: User's wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "canAccess": false,
    "message": "User cannot access premium features"
  }
}
```

#### GET /api/auth/premium-wallet
Get user's premium wallet for reward claiming.

**Query Parameters:**
- `lensProfileId`: User's Lens profile ID

**Response:**
```json
{
  "success": true,
  "data": {
    "premiumWalletAddress": "0x...",
    "message": "Premium wallet found"
  }
}
```

### Premium Registration

#### POST /api/premium-registration/status
Get user's premium status.

**Query Parameters:**
- `walletAddress`: User's wallet address
- `lensProfileId`: User's Lens profile ID (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "userStatus": {
      "status": "Standard|Premium|OnChainUnlinked",
      "walletAddress": "0x...",
      "isPremiumOnChain": false,
      "hasLinkedProfile": false
    },
    "requiresMetaMaskConnection": true,
    "requiresNetworkSwitch": false,
    "canAccessPremiumFeatures": false,
    "canClaimRewards": false
  }
}
```

#### POST /api/premium-registration/register
Handle premium registration request.

**Request Body:**
```json
{
  "userAddress": "0x...",
  "referrerAddress": "0x...",
  "lensProfileId": "0x...", // Optional
  "transactionHash": "0x..." // Optional, for completion
}
```

**Response (Initial Request):**
```json
{
  "success": false,
  "message": "MetaMask connection required for premium registration",
  "userStatus": "Standard",
  "requiresMetaMaskConnection": true,
  "requiresNetworkSwitch": true
}
```

**Response (Completion with Transaction):**
```json
{
  "success": true,
  "message": "Premium registration completed successfully",
  "userStatus": "Premium",
  "linkedProfile": {
    "profileId": "0x...",
    "handle": "username",
    "linkedAt": "2024-01-01T00:00:00Z"
  },
  "transactionHash": "0x..."
}
```

#### POST /api/premium-registration/verify
Verify registration and link profile.

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "lensProfileId": "0x...", // Optional
  "transactionHash": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration verified and profile linked successfully",
  "userStatus": "Premium",
  "linkedProfile": {
    "profileId": "0x...",
    "handle": "username",
    "linkedAt": "2024-01-01T00:00:00Z"
  },
  "transactionHash": "0x..."
}
```

#### POST /api/premium-registration/auto-link
Auto-link first available profile for a premium wallet.

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "lensProfileId": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile auto-linked successfully",
  "userStatus": "Premium",
  "linkedProfile": {
    "profileId": "0x...",
    "handle": "username",
    "linkedAt": "2024-01-01T00:00:00Z"
  },
  "linkedProfileId": "0x..."
}
```

#### POST /api/premium-registration/link
Manually link profile to wallet.

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "profileId": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile linked successfully",
  "userStatus": "Premium",
  "linkedProfile": {
    "profileId": "0x...",
    "handle": "username",
    "linkedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Response (Wallet Already Linked):**
```json
{
  "success": false,
  "message": "Wallet already has a permanently linked profile",
  "rejectionReason": "Your premium wallet is already connected to another one of your Lens profiles and is premium. You are not allowed to make this profile premium.",
  "userStatus": "Standard"
}
```

#### GET /api/premium-registration/connection-status
Check wallet connection status for MetaMask validation.

**Query Parameters:**
- `walletAddress`: User's wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x...",
    "isPremium": false,
    "requiresMetaMaskConnection": true,
    "requiresNetworkSwitch": true,
    "message": "MetaMask connection required for premium registration"
  }
}
```

#### GET /api/premium-registration/validate-reward-claiming
Validate wallet for reward claiming.

**Query Parameters:**
- `walletAddress`: User's wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": false,
    "message": "To claim rewards, you must use your premium wallet, which is MetaMask.",
    "isPremiumWallet": false,
    "requiresNetworkSwitch": false
  }
}
```

#### GET /api/premium-registration/comprehensive-status
Get comprehensive user status.

**Query Parameters:**
- `walletAddress`: User's wallet address
- `lensProfileId`: User's Lens profile ID (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "userStatus": {
      "status": "Standard|Premium|OnChainUnlinked",
      "walletAddress": "0x...",
      "isPremiumOnChain": false,
      "hasLinkedProfile": false,
      "canLinkProfile": false
    },
    "requiresMetaMaskConnection": true,
    "requiresNetworkSwitch": false,
    "canAccessPremiumFeatures": false,
    "canClaimRewards": false
  }
}
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Wallet address is required"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### Rejection Reasons

When a profile cannot be linked, the API returns specific rejection reasons:

1. **Wallet Already Linked**: "Your premium wallet is already connected to another one of your Lens profiles and is premium. You are not allowed to make this profile premium."

2. **Profile Already Linked**: "Profile is already linked to another wallet"

3. **Invalid Referrer**: "Invalid referrer address"

4. **MetaMask Required**: "MetaMask connection required for premium registration"

5. **Network Switch Required**: "Please switch to Arbitrum One network"

## Frontend Integration

### 1. Login Flow
```typescript
// Check user status on login
const response = await fetch('/api/auth/login-enhanced', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress: userWallet,
    lensProfileId: lensProfileId
  })
});

const result = await response.json();

if (result.requiresMetaMaskConnection) {
  // Show MetaMask connection prompt
  showMetaMaskPrompt();
} else if (result.requiresNetworkSwitch) {
  // Show network switch prompt
  showNetworkSwitchPrompt();
}
```

### 2. Premium Registration Flow
```typescript
// Initial registration request
const response = await fetch('/api/premium-registration/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userAddress: userWallet,
    referrerAddress: referrerWallet,
    lensProfileId: lensProfileId
  })
});

const result = await response.json();

if (result.requiresMetaMaskConnection) {
  // Connect MetaMask
  await connectMetaMask();
  // Switch to Arbitrum network
  await switchToArbitrum();
  // Complete registration
  await completeRegistration();
}
```

### 3. Reward Claiming Flow
```typescript
// Validate wallet for reward claiming
const response = await fetch(`/api/premium-registration/validate-reward-claiming?walletAddress=${walletAddress}`);
const result = await response.json();

if (!result.data.isValid) {
  if (result.data.message.includes('MetaMask')) {
    showMetaMaskRequiredMessage();
  } else if (result.data.message.includes('network')) {
    showNetworkSwitchPrompt();
  }
}
```

## Security Considerations

1. **Wallet Validation**: All wallet addresses are validated for format and ownership
2. **Permanent Linking**: Once a profile is linked to a premium wallet, it cannot be unlinked
3. **Referrer Validation**: Referrer addresses are validated against the blockchain
4. **Transaction Verification**: Registration completion requires valid transaction hash
5. **Rate Limiting**: API endpoints include rate limiting to prevent abuse

## Testing

### Test Scenarios

1. **Standard User Login**: Should return `userStatus: "Standard"`
2. **Premium Wallet First Link**: Should auto-link and return `userStatus: "Premium"`
3. **Premium Wallet Second Link**: Should reject with permanent linking message
4. **MetaMask Requirement**: Should return `requiresMetaMaskConnection: true`
5. **Network Switch Requirement**: Should return `requiresNetworkSwitch: true`
6. **Reward Claiming Validation**: Should validate premium wallet requirement

### Test Endpoints

- Use `/api/premium-registration/status` to check user status
- Use `/api/premium-registration/connection-status` to validate wallet requirements
- Use `/api/premium-registration/validate-reward-claiming` to test reward claiming validation

## Migration Notes

1. **Database Schema**: Update UserStatus enum to include 'OnChainUnlinked'
2. **Existing Users**: Run migration to ensure data consistency
3. **Frontend Updates**: Update frontend to handle new status types
4. **API Versioning**: Consider API versioning for backward compatibility

## Support

For questions or issues with the enhanced user status system, please refer to:
- API documentation
- Error logs
- User status service implementation
- Premium registration controller
