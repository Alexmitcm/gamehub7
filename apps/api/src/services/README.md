# Premium System Services Architecture

## Overview

The Hey Pro premium system has been refactored into a modular, event-driven architecture to support large-scale operations and future feature integrations. The system is now composed of specialized services that handle specific concerns.

## Service Architecture

### 1. PremiumService (Orchestrator)
**Location**: `apps/api/src/services/PremiumService.ts`

The main orchestrator service that coordinates between blockchain operations, user data management, and event emission. It acts as the primary interface for the API controllers.

**Responsibilities**:
- Orchestrates business logic flows
- Coordinates between BlockchainService and UserService
- Emits events for system-wide notifications
- Provides a clean API for controllers

**Key Methods**:
- `getUserPremiumStatus()` - Get comprehensive user status
- `linkProfile()` - Link profile to wallet with validation
- `autoLinkFirstProfile()` - Auto-link first available profile
- `verifyRegistrationTransaction()` - Verify on-chain registration

### 2. BlockchainService (On-Chain Operations)
**Location**: `apps/api/src/services/BlockchainService.ts`

Handles all blockchain interactions and smart contract calls. This is the single source of truth for all on-chain operations.

**Responsibilities**:
- Smart contract interactions
- Transaction verification
- Balance checking
- Node data retrieval
- Referrer validation

**Key Methods**:
- `isWalletPremium()` - Check if wallet is premium on-chain
- `getNodeData()` - Get detailed node information
- `getUsdtBalance()` - Check USDT balance
- `verifyRegistrationTransaction()` - Verify registration transactions
- `getProfileStats()` - Get comprehensive profile statistics

**Contracts Supported**:
- Referral Contract (NodeSet, registration)
- Game Vault Contracts (rewards)
- USDT Contract (balance checking)

### 3. UserService (Database Operations)
**Location**: `apps/api/src/services/UserService.ts`

Manages all database operations related to premium profiles and user data. Enforces business rules around profile linking.

**Responsibilities**:
- Premium profile database operations
- Profile linking/unlinking logic
- User status management
- Business rule enforcement

**Key Methods**:
- `getUserPremiumStatus()` - Get user status from database
- `linkProfileToWallet()` - Link profile permanently
- `autoLinkFirstProfile()` - Auto-link first profile
- `getAvailableProfiles()` - Get linkable profiles
- `getLinkedProfile()` - Get currently linked profile

**Business Rules Enforced**:
- Profile linking is permanent and irreversible
- One wallet can only have one linked profile
- One profile can only be linked to one wallet
- First selected profile becomes permanent

### 4. EventService (Event-Driven Architecture)
**Location**: `apps/api/src/services/EventService.ts`

Provides event-driven architecture for system-wide notifications and integrations. Allows other systems to listen to premium-related events.

**Responsibilities**:
- Event emission and handling
- Event queue management
- Listener registration
- Asynchronous event processing

**Event Types**:
- `profile.linked` - Profile successfully linked
- `profile.auto-linked` - Profile auto-linked
- `registration.verified` - Registration transaction verified
- `premium.status.changed` - User status changed
- `profile.deactivated` - Profile deactivated

**Key Methods**:
- `emitEvent()` - Emit custom events
- `addEventListener()` - Register event listeners
- `emitProfileLinked()` - Emit profile linked event
- `emitRegistrationVerified()` - Emit registration verified event

## Data Flow Examples

### 1. Profile Linking Flow
```
Controller → PremiumService.linkProfile()
├── BlockchainService.isWalletPremium() ✅
├── UserService.linkProfileToWallet() ✅
└── EventService.emitProfileLinked() ✅
```

### 2. Registration Verification Flow
```
Controller → PremiumService.verifyRegistrationTransaction()
├── BlockchainService.verifyRegistrationTransaction() ✅
└── EventService.emitRegistrationVerified() ✅
```

### 3. Status Check Flow
```
Controller → PremiumService.getUserPremiumStatus()
├── BlockchainService.isWalletPremium() ✅
├── UserService.getUserPremiumStatus() ✅
└── EventService.emitPremiumStatusChanged() ✅
```

## Error Handling

Each service implements comprehensive error handling:

- **BlockchainService**: Handles RPC failures, contract errors, network issues
- **UserService**: Handles database errors, validation failures, business rule violations
- **PremiumService**: Orchestrates error handling and provides user-friendly messages
- **EventService**: Handles event processing failures gracefully

## Future Extensibility

### Adding New Features

1. **Quest System**: Add `QuestService` and listen to `profile.linked` events
2. **Coin System**: Add `CoinService` and listen to `registration.verified` events
3. **Analytics**: Add `AnalyticsService` and listen to all events
4. **Notifications**: Add `NotificationService` and listen to status change events

### Example: Adding Quest System
```typescript
// In QuestService
EventService.addEventListener('profile.linked', async (event) => {
  await this.assignWelcomeQuest(event.walletAddress);
});

EventService.addEventListener('registration.verified', async (event) => {
  await this.assignReferralQuest(event.walletAddress, event.referrerAddress);
});
```

## Environment Variables

Required environment variables for the services:

```bash
# Blockchain Configuration
REFERRAL_CONTRACT_ADDRESS=0x3bC03e9793d2E67298fb30871a08050414757Ca7
BALANCED_GAME_VAULT_ADDRESS=<address>
UNBALANCED_GAME_VAULT_ADDRESS=<address>
USDT_CONTRACT_ADDRESS=0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9
INFURA_URL=<arbitrum_rpc_url>

# JWT Configuration
JWT_SECRET=<secret_key>
```

## Testing

Each service can be tested independently:

- **BlockchainService**: Mock viem client for contract interactions
- **UserService**: Mock Prisma client for database operations
- **EventService**: Mock event listeners for event testing
- **PremiumService**: Integration tests with mocked dependencies

## Performance Considerations

- **Caching**: BlockchainService can implement caching for frequently accessed data
- **Connection Pooling**: UserService uses Prisma's connection pooling
- **Event Batching**: EventService processes events in batches
- **Async Processing**: Events are processed asynchronously to avoid blocking

## Security

- **Input Validation**: All services validate inputs
- **Business Rules**: UserService enforces permanent linking rules
- **Transaction Safety**: Database operations use transactions
- **Error Sanitization**: Errors are sanitized before returning to clients 