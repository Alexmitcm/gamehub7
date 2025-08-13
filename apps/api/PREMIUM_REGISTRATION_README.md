# Premium Registration Process Backend

This document describes the rebuilt Premium Registration Process backend that handles all interactions with the smart contract and manages user status transitions.

## Overview

The Premium Registration Process is the core backend system that manages user premium status, handles MetaMask wallet connections, verifies on-chain transactions, manages permanent profile linking according to strict business rules, provides real-time WebSocket updates, and includes comprehensive admin functionality.

## User Statuses

### 1. Standard
- A user who is not registered in our smart contract but has a Lens profile
- No access to Pro features or referral dashboard
- Must complete premium registration to upgrade

### 2. Premium (ProLinked)
- A user with full access to Pro features
- Has successfully registered on-chain AND linked a Lens profile
- Permanent status that cannot be changed

### 3. OnChainUnlinked
- A user who is premium on the blockchain but has not yet linked a profile
- Has completed on-chain registration but needs to link a Lens profile
- Can link any of their owned profiles (first link becomes permanent)

## Business Rules

### Permanent Link Rule
- Each premium wallet can only be linked to **one** Lens profile, permanently and irreversibly
- The first profile to be linked will be the winner
- No profile unlinking is allowed

### Wallet Separation
- **Premium Wallet (MetaMask)**: Used only for "Claim Reward" and "Referral Dashboard" pages
- **Lens Wallet**: Used for all other application features

### Registration Requirements
- Must use MetaMask wallet for premium registration
- Must be on Arbitrum One network
- Must have minimum 200 USDT balance
- Must have valid referrer address

## Architecture

### Services

#### PremiumRegistrationService
The main service that orchestrates the entire premium registration process:

- `getPremiumStatus()` - Get comprehensive user status
- `handlePremiumRegistration()` - Main registration entry point
- `verifyRegistrationAndLinkProfile()` - Verify transactions and link profiles
- `autoLinkFirstProfile()` - Auto-link first available profile
- `linkProfileToWallet()` - Manually link specific profile
- `checkWalletConnectionStatus()` - Check MetaMask connection
- `getRegistrationInstructions()` - Get frontend instructions

#### WebSocketService
Handles real-time communication with clients:

- `broadcastTransactionUpdate()` - Broadcast transaction status updates
- `broadcastRegistrationUpdate()` - Broadcast registration progress
- `broadcastPremiumStatusUpdate()` - Broadcast premium status changes
- `broadcastProfileLinkedUpdate()` - Broadcast profile linking events
- `getStats()` - Get connection statistics

#### AdminService
Provides comprehensive admin functionality:

- `getAdminUserView()` - Get detailed user view for admin
- `getAllAdminUsers()` - Get all users with pagination and filtering
- `forceUnlinkProfile()` - Force unlink profile (admin override)
- `forceLinkProfile()` - Force link profile (admin override)
- `grantPremiumAccess()` - Grant premium access manually
- `addAdminNote()` - Add admin notes to user records
- `getAdminStats()` - Get platform statistics
- `getAdminActionHistory()` - Get admin action audit trail
- `getFeatureList()` - Get feature access controls

#### BlockchainService
Handles all blockchain interactions:

- `isWalletPremium()` - Check if wallet is premium on-chain
- `validateReferrer()` - Validate referrer address
- `verifyRegistrationTransaction()` - Verify registration transactions
- `getProfileStats()` - Get on-chain profile statistics

#### UserService
Manages user data and profile linking:

- `getLinkedProfile()` - Get linked profile for wallet
- `linkProfileToWallet()` - Link profile to wallet (permanent)
- `autoLinkFirstProfile()` - Auto-link first profile
- `getAvailableProfiles()` - Get profiles available for linking

### Controllers

#### PremiumRegistrationController
Handles HTTP requests and validation:

- Input validation using Zod schemas
- Error handling and response formatting
- Rate limiting integration
- Authentication middleware support

### Routes

#### `/premium-registration/*`
All premium registration endpoints:

- `GET /premium-status` - Get user premium status
- `POST /register` - Handle registration process
- `POST /verify-registration` - Verify transactions
- `POST /auto-link-profile` - Auto-link first profile
- `POST /link-profile` - Manually link profile
- `GET /wallet-connection-status` - Check wallet status
- `GET /registration-instructions` - Get instructions
- `GET /validate-referrer` - Validate referrer

#### `/admin/*`
All admin functionality endpoints:

- `GET /user` - Get comprehensive admin view of a user
- `GET /users` - Get all users with admin view
- `POST /force-unlink-profile` - Force unlink a profile (admin override)
- `POST /force-link-profile` - Force link a profile (admin override)
- `POST /grant-premium` - Grant premium access (admin override)
- `POST /add-note` - Add admin note to user
- `GET /stats` - Get admin statistics
- `GET /actions` - Get admin action history
- `GET /features` - Get feature list with access controls

#### `/ws`
WebSocket endpoint for real-time updates:

- Connect with wallet address as query parameter
- Subscribe to transaction and wallet updates
- Receive real-time status changes

## API Endpoints

### Get Premium Status
```http
GET /premium-registration/premium-status?walletAddress=0x...
POST /premium-registration/premium-status
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "data": {
    "userStatus": "Standard|OnChainUnlinked|ProLinked",
    "isPremiumOnChain": true,
    "hasLinkedProfile": true,
    "linkedProfile": {
      "profileId": "0x...",
      "handle": "user.lens",
      "linkedAt": "2024-01-01T00:00:00Z"
    },
    "availableProfiles": [...],
    "canLink": true,
    "message": "User is premium with linked profile"
  },
  "status": "Success"
}
```

### Handle Premium Registration
```http
POST /premium-registration/register
Content-Type: application/json

{
  "userAddress": "0x...",
  "referrerAddress": "0x...",
  "lensProfileId": "0x...",
  "lensWalletAddress": "0x..."
}
```

**Response:**
```json
{
  "data": {
    "success": true,
    "userStatus": "ProLinked",
    "linkedProfile": {...},
    "message": "Registration successful and profile linked",
    "requiresMetaMaskConnection": false,
    "requiresNetworkSwitch": false
  },
  "status": "Success"
}
```

### Verify Registration Transaction
```http
POST /premium-registration/verify-registration
Content-Type: application/json

{
  "userAddress": "0x...",
  "referrerAddress": "0x...",
  "transactionHash": "0x...",
  "lensProfileId": "0x..."
}
```

### Auto-Link First Profile
```http
POST /premium-registration/auto-link-profile
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

### Manually Link Profile
```http
POST /premium-registration/link-profile
Content-Type: application/json

{
  "walletAddress": "0x...",
  "profileId": "0x..."
}
```

### Get Registration Instructions
```http
GET /premium-registration/registration-instructions
```

**Response:**
```json
{
  "data": {
    "steps": [
      "Connect MetaMask wallet",
      "Switch to Arbitrum One network",
      "Ensure you have at least 200 USDT in your wallet",
      "Click 'Register for Premium'",
      "Confirm the transaction in MetaMask",
      "Wait for transaction confirmation",
      "Link your Lens profile (optional)"
    ],
    "requirements": [
      "MetaMask wallet",
      "Arbitrum One network",
      "Minimum 200 USDT balance",
      "Valid referrer address"
    ],
    "networkInfo": {
      "chainId": "0xa4b1",
      "chainName": "Arbitrum One",
      "rpcUrl": "https://..."
    }
  },
  "status": "Success"
}
```

## Admin API Endpoints

### Get Admin User View
```http
GET /admin/user?walletAddress=0x...
POST /admin/user
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "data": {
    "walletAddress": "0x...",
    "userStatus": "ProLinked",
    "isPremiumOnChain": true,
    "hasLinkedProfile": true,
    "linkedProfile": {
      "profileId": "0x...",
      "handle": "user.lens",
      "linkedAt": "2024-01-01T00:00:00Z"
    },
    "registrationDate": "2024-01-01T00:00:00Z",
    "referrerAddress": "0x...",
    "registrationTxHash": "0x...",
    "premiumUpgradedAt": "2024-01-01T00:00:00Z",
    "lastActiveAt": "2024-01-01T00:00:00Z",
    "totalLogins": 42,
    "availableFeatures": ["lens_profile_access", "premium_badge", "referral_dashboard"],
    "adminNotes": "Customer support note"
  },
  "status": "Success"
}
```

### Get All Admin Users
```http
GET /admin/users?page=1&limit=50&status=ProLinked
POST /admin/users
Content-Type: application/json

{
  "page": 1,
  "limit": 50,
  "status": "ProLinked"
}
```

### Force Unlink Profile
```http
POST /admin/force-unlink-profile
Content-Type: application/json

{
  "adminId": "admin_001",
  "walletAddress": "0x...",
  "reason": "Customer request"
}
```

### Force Link Profile
```http
POST /admin/force-link-profile
Content-Type: application/json

{
  "adminId": "admin_001",
  "walletAddress": "0x...",
  "profileId": "0x...",
  "reason": "Customer request"
}
```

### Grant Premium Access
```http
POST /admin/grant-premium
Content-Type: application/json

{
  "adminId": "admin_001",
  "walletAddress": "0x...",
  "reason": "Customer request"
}
```

### Add Admin Note
```http
POST /admin/add-note
Content-Type: application/json

{
  "adminId": "admin_001",
  "walletAddress": "0x...",
  "note": "Customer support note"
}
```

### Get Admin Statistics
```http
GET /admin/stats
```

**Response:**
```json
{
  "data": {
    "totalUsers": 1000,
    "standardUsers": 800,
    "onChainUnlinkedUsers": 50,
    "proLinkedUsers": 150,
    "totalPremiumWallets": 200,
    "totalLinkedProfiles": 150,
    "recentRegistrations": 25,
    "recentProfileLinks": 10
  },
  "status": "Success"
}
```

### Get Feature List
```http
GET /admin/features
```

**Response:**
```json
{
  "data": [
    {
      "featureId": "lens_profile_access",
      "featureName": "Lens Profile Access",
      "description": "Access to Lens Protocol features",
      "standardAccess": true,
      "premiumAccess": true,
      "adminOverride": false
    },
    {
      "featureId": "premium_badge",
      "featureName": "Premium Badge",
      "description": "Display premium badge on profile",
      "standardAccess": false,
      "premiumAccess": true,
      "adminOverride": true
    }
  ],
  "status": "Success"
}
```

## WebSocket API

### Connection
Connect to WebSocket at `/ws` with wallet address as query parameter:
```
ws://localhost:3010/ws?walletAddress=0x...
```

### Message Types

#### Subscribe to Transaction
```json
{
  "type": "subscribe_transaction",
  "transactionHash": "0x..."
}
```

#### Subscribe to Wallet
```json
{
  "type": "subscribe_wallet",
  "walletAddress": "0x..."
}
```

#### Ping
```json
{
  "type": "ping"
}
```

### Update Types

#### Transaction Status Update
```json
{
  "type": "transaction_status",
  "data": {
    "transactionHash": "0x...",
    "status": "confirmed",
    "blockNumber": 12345678,
    "confirmations": 12,
    "gasUsed": "150000",
    "message": "Transaction confirmed successfully"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Registration Update
```json
{
  "type": "registration_update",
  "data": {
    "walletAddress": "0x...",
    "status": "completed",
    "message": "Registration completed successfully",
    "userStatus": "ProLinked",
    "linkedProfile": {
      "profileId": "0x...",
      "handle": "user.lens",
      "linkedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Premium Status Update
```json
{
  "type": "premium_status",
  "data": {
    "walletAddress": "0x...",
    "userStatus": "ProLinked",
    "isPremiumOnChain": true,
    "hasLinkedProfile": true,
    "availableFeatures": ["lens_profile_access", "premium_badge", "referral_dashboard"],
    "message": "Premium status updated"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## User Flow Scenarios

### Scenario 1: Standard User Registration
1. User clicks "Join Hey Pro" banner
2. Premium Registration Modal opens
3. User connects MetaMask wallet
4. System auto-switches to Arbitrum One network
5. User enters referrer address
6. User confirms registration transaction
7. Backend verifies transaction and links profile
8. User becomes ProLinked

### Scenario 2: Premium Wallet, No Lens Profile
1. User logs in with premium wallet
2. System detects wallet is premium but no profile linked
3. User selects Lens profile to link
4. First profile becomes permanently linked
5. User becomes ProLinked

### Scenario 3: Premium Wallet, Multiple Lens Profiles
1. User logs in with premium wallet
2. System shows all available profiles
3. User selects first profile
4. First profile becomes permanently linked
5. Other profiles remain unlinked forever

### Scenario 4: Non-Premium User with Lens Profile
1. User has Lens profile but not premium
2. User connects MetaMask wallet
3. User completes registration on-chain
4. MetaMask becomes premium wallet
5. Lens profile becomes permanently linked
6. User becomes ProLinked

## Error Handling

### Common Error Responses

**Invalid Referrer:**
```json
{
  "data": {
    "success": false,
    "userStatus": "Standard",
    "message": "Invalid referrer address"
  }
}
```

**Wallet Not Premium:**
```json
{
  "data": {
    "success": false,
    "userStatus": "Standard",
    "message": "Wallet is not premium"
  }
}
```

**Profile Already Linked:**
```json
{
  "data": {
    "success": false,
    "userStatus": "ProLinked",
    "message": "Wallet already has linked profile"
  }
}
```

**Invalid Transaction:**
```json
{
  "data": {
    "success": false,
    "userStatus": "Standard",
    "message": "Invalid registration transaction"
  }
}
```

## Testing

### Run Tests
```bash
# Run the premium registration test file
npx tsx src/test-premium-registration.ts

# Run the WebSocket and Admin service test file
npx tsx src/test-websocket-admin.ts

# Or run with environment variables
TEST_WALLET_ADDRESS=0x... npx tsx src/test-premium-registration.ts
```

### Test Endpoints
```bash
# Test premium registration endpoints
curl "http://localhost:3010/premium-registration/premium-status?walletAddress=0x..."
curl "http://localhost:3010/premium-registration/registration-instructions"
curl "http://localhost:3010/premium-registration/health"

# Test admin endpoints
curl "http://localhost:3010/admin/features"
curl "http://localhost:3010/admin/stats"
curl "http://localhost:3010/admin/health"

# Test WebSocket connection (using wscat or similar tool)
wscat -c "ws://localhost:3010/ws?walletAddress=0x..."
```

## Environment Variables

Required environment variables:

```env
DATABASE_URL=postgresql://...
REFERRAL_CONTRACT_ADDRESS=0x3bC03e9793d2E67298fb30871a08050414757Ca7
INFURA_URL=https://arbitrum-mainnet.infura.io/v3/...
JWT_SECRET=your_jwt_secret_here
```

## Security Considerations

1. **Rate Limiting**: All endpoints have appropriate rate limits
2. **Input Validation**: All inputs are validated using Zod schemas
3. **Transaction Verification**: All on-chain transactions are verified
4. **Profile Ownership**: Profile linking requires ownership verification
5. **Permanent Links**: Profile unlinking is blocked by business rules

## Monitoring and Logging

The system includes comprehensive logging:

- Registration attempts and results
- Transaction verifications
- Profile linking events
- Error conditions and stack traces
- User status transitions

## Future Enhancements

1. **Database Schema Updates**: Add `AdminAction` model and `adminNotes` field to `User` model
2. **WebSocket Integration**: Integrate WebSocket broadcasts into existing services
3. **Admin Panel Frontend**: Create admin interface for managing users and features
4. **Feature Implementation**: Ensure all "Pro Lens" features are available to premium users
5. **Batch Operations**: Bulk profile linking and management
6. **Analytics**: Registration funnel tracking and admin analytics
7. **Multi-chain Support**: Support for additional networks
8. **Advanced Admin Features**: Role-based access control, audit logs, automated actions

## Support

For issues or questions about the Premium Registration Process:

1. Check the logs for detailed error information
2. Verify environment variables are correctly set
3. Test with the provided test file
4. Review the API documentation above
5. Contact the development team for assistance
