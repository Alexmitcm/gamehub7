# Premium Profile Implementation Guide

## Overview

This implementation provides a complete solution for automatically linking premium Lens profiles to wallets registered in the referral smart contract on Arbitrum. The system handles three distinct cases with appropriate business logic and user experience.

## Business Logic

### Case 1: Wallet Registered, No Lens Profile Yet
- **Trigger**: User connects wallet → backend checks NodeSet → user is premium
- **Flow**: User proceeds with Lens signup → profile automatically linked on first login
- **UX**: Seamless, no confirmation modal
- **Backend**: Auto-links new profile immediately

### Case 2: Wallet Has Exactly One Lens Profile
- **Trigger**: Wallet connection + login with single profile
- **Flow**: Backend finds one profile → auto-links immediately
- **UX**: Seamless, no user interaction required
- **Backend**: Automatic linking with JWT issuance

### Case 3: Wallet Has Multiple Lens Profiles (First Time)
- **Trigger**: Wallet connection + multiple profiles detected
- **Flow**: Non-dismissible modal prompts profile selection
- **UX**: One-time selection with clear warning about permanence
- **Backend**: Manual linking after user selection

## Backend Implementation

### PremiumService Class (`apps/api/src/services/PremiumService.ts`)

#### Key Methods:

1. **`getUserPremiumStatus(walletAddress)`**
   - Returns: `'Standard' | 'OnChainUnlinked' | 'ProLinked'`
   - Checks NodeSet contract + database for current status

2. **`autoLinkFirstProfile(walletAddress)`**
   - Handles Cases 1 & 2 automatically
   - Links first available profile permanently
   - Throws error if wallet not registered or already linked

3. **`linkProfile(walletAddress, profileId)`**
   - Handles Case 3 manual linking
   - Validates profile ownership
   - Prevents double-linking with transaction safety

4. **`getAvailableProfiles(walletAddress)`**
   - Returns only unlinked profiles for eligible wallets
   - Enforces business rules (no profiles if already linked)

#### Security Features:
- ✅ Wallet address normalization (lowercase)
- ✅ Atomic transactions with Prisma
- ✅ Environment variable configuration
- ✅ Secure JWT signing (no fallback secrets)
- ✅ Proper error handling and validation

### API Endpoints

#### `/api/premium/status` (POST)
```typescript
// Request
{ walletAddress: string }

// Response
{
  userStatus: 'Standard' | 'OnChainUnlinked' | 'ProLinked';
  linkedProfile?: {
    profileId: string;
    handle: string;
    linkedAt: Date;
  } | null;
}
```

#### `/api/premium/profiles` (POST)
```typescript
// Request
{ walletAddress: string }

// Response
{
  profiles: Profile[];
  canLink: boolean;
  linkedProfile?: LinkedProfile | null;
}
```

#### `/api/premium/auto-link` (POST)
```typescript
// Request
{ walletAddress: string }

// Response
{
  profileId: string;
  handle: string;
  linkedAt: Date;
}
```

#### `/api/premium/link` (POST)
```typescript
// Request
{ walletAddress: string; profileId: string }

// Response
{
  profileId: string;
  handle: string;
  linkedAt: Date;
}
```

## Frontend Implementation

### React Components

#### 1. `ProfileSelectionModal` (`apps/web/src/components/Premium/ProfileSelectionModal.tsx`)
- **Purpose**: Case 3 modal for profile selection
- **Features**:
  - Non-dismissible during submission
  - Clear warning about permanence
  - Radio button selection
  - Loading states
  - Error handling

#### 2. `PremiumProfileManager` (`apps/web/src/components/Premium/PremiumProfileManager.tsx`)
- **Purpose**: Main component handling all three cases
- **Features**:
  - Automatic case detection
  - Auto-linking for Cases 1 & 2
  - Modal triggering for Case 3
  - Status display for all states
  - Error handling and loading states

### Custom Hook

#### `usePremiumProfileSelection` (`apps/web/src/hooks/usePremiumProfileSelection.tsx`)
- **Purpose**: State management and API calls
- **Features**:
  - Automatic status fetching on wallet connection
  - Case detection helpers
  - API integration
  - Error handling
  - Loading states

## Environment Variables

Required environment variables in `apps/api/env.d.ts`:

```typescript
INFURA_URL: string;
REFERRAL_CONTRACT_ADDRESS: string;
BALANCED_GAME_VAULT_ADDRESS: string;
UNBALANCED_GAME_VAULT_ADDRESS: string;
JWT_SECRET: string; // Required for secure JWT signing
```

## Database Schema

The Prisma schema already includes the necessary structure:

```prisma
model PremiumProfile {
  id              String    @id @default(cuid())
  walletAddress   String    @unique
  profileId       String    @unique
  isActive        Boolean   @default(true)
  linkedAt        DateTime  @default(now())
  deactivatedAt   DateTime?

  @@index([walletAddress])
  @@index([profileId])
}
```

## Usage Example

### Basic Integration

```tsx
import PremiumProfileManager from '@/components/Premium/PremiumProfileManager';

function App() {
  return (
    <div>
      <PremiumProfileManager />
      {/* Your app content */}
    </div>
  );
}
```

### Advanced Usage with Custom Logic

```tsx
import { usePremiumProfileSelection } from '@/hooks/usePremiumProfileSelection';

function CustomPremiumHandler() {
  const {
    premiumStatus,
    isRegistered,
    isLinked,
    autoLinkFirstProfile,
    linkProfile
  } = usePremiumProfileSelection();

  // Custom logic based on premium status
  if (isRegistered && !isLinked) {
    // Handle Cases 1, 2, or 3
  }

  return (
    // Your custom UI
  );
}
```

## Error Handling

The implementation includes comprehensive error handling:

1. **Network Errors**: Retry logic and user-friendly messages
2. **Validation Errors**: Zod schema validation with detailed feedback
3. **Business Logic Errors**: Clear error messages for each case
4. **Database Errors**: Transaction rollback and error logging

## Security Considerations

1. **Wallet Address Normalization**: Prevents case-sensitivity issues
2. **Atomic Transactions**: Prevents race conditions
3. **Profile Ownership Validation**: Ensures users can only link their own profiles
4. **JWT Security**: No fallback secrets, proper expiration
5. **Rate Limiting**: API endpoints are rate-limited
6. **Input Validation**: Zod schemas validate all inputs

## Testing

### Backend Tests
- Unit tests for PremiumService methods
- Integration tests for API endpoints
- Contract interaction tests

### Frontend Tests
- Component rendering tests
- Hook behavior tests
- User interaction tests
- Error handling tests

## Deployment Checklist

- [ ] Set all required environment variables
- [ ] Deploy database migrations
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Test all three cases in staging
- [ ] Verify contract addresses are correct
- [ ] Test JWT token generation and validation

## Future Enhancements

1. **Profile Migration**: Allow one-time profile changes (with admin approval)
2. **Batch Operations**: Support for bulk profile linking
3. **Analytics**: Track linking patterns and user behavior
4. **Notifications**: Email/SMS notifications for profile linking
5. **Audit Log**: Detailed logging of all profile linking actions 