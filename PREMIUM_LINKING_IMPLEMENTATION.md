# Premium Profile Linking Implementation

This document describes the implementation of the Premium profile linking logic for the Lens-based social media platform.

## Overview

The Premium profile linking system ensures that premium users (verified through the NodeSet contract) can link one of their Lens profiles permanently to their premium status. This linking is one-time and irreversible, providing a secure and consistent premium experience.

## Business Logic

### 1. Premium User with No Lens Profile
- When a premium user creates their first Lens profile, it's automatically marked as their Premium profile
- The linkage is saved in the `premiumProfile` table with `walletAddress` and `profileId`

### 2. Premium User with Existing Lens Profiles
- **Single Profile**: Auto-linked automatically
- **Multiple Profiles**: User is shown a modal to select one profile for permanent linking

### 3. Standard User Who Becomes Premium Later
- After registering in the Premium system (referral smart contract)
- If they already have a Lens profile → link it if not already linked
- Otherwise, follow Rule 1 or 2 depending on profile count

## Backend Implementation

### Core Service: `PremiumService`

#### Key Methods

1. **`verifyPremiumByNodeset(walletAddress: string): Promise<boolean>`**
   - Main function to check if a wallet is premium
   - Queries the NodeSet contract to verify premium status
   - Returns `true` if wallet is in NodeSet, `false` otherwise

2. **`getUserPremiumStatus(walletAddress: string)`**
   - Returns user status: `"Standard" | "OnChainUnlinked" | "ProLinked"`
   - Includes linked profile information if available

3. **`autoLinkFirstProfile(walletAddress: string)`**
   - Automatically links the first available profile for premium users
   - Enforces business rule: first selected profile becomes permanent

4. **`linkProfile(walletAddress: string, profileId: string)`**
   - Manually links a specific profile
   - Only works for premium wallets that haven't linked yet
   - Enforces permanent linking (no changes allowed)

5. **`getAvailableProfiles(walletAddress: string)`**
   - Returns available profiles for linking
   - Only returns profiles for premium wallets that can still link

### Database Schema

```sql
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

### API Endpoints

#### 1. Get User Premium Status
```http
POST /api/premium/user-status
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

Response:
```json
{
  "userStatus": "Standard" | "OnChainUnlinked" | "ProLinked",
  "linkedProfile": {
    "profileId": "profile123",
    "handle": "testuser",
    "linkedAt": "2024-01-01T00:00:00Z"
  } | null
}
```

#### 2. Auto-Link First Profile
```http
POST /api/premium/auto-link
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

Response:
```json
{
  "profileId": "profile123",
  "handle": "testuser",
  "linkedAt": "2024-01-01T00:00:00Z"
}
```

#### 3. Get Available Profiles
```http
POST /api/premium/available-profiles
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

Response:
```json
{
  "profiles": [
    {
      "id": "profile123",
      "handle": "testuser",
      "ownedBy": "0x...",
      "isDefault": true
    }
  ],
  "canLink": true,
  "linkedProfile": null
}
```

#### 4. Link Profile
```http
POST /api/premium/link
Content-Type: application/json

{
  "walletAddress": "0x...",
  "profileId": "profile123"
}
```

Response:
```json
{
  "profileId": "profile123",
  "handle": "testuser",
  "linkedAt": "2024-01-01T00:00:00Z"
}
```

## Frontend Implementation

### Core Hook: `useInitPremium`

The `useInitPremium` hook manages the entire premium linking flow:

```typescript
export const useInitPremium = () => {
  // Queries for premium status and available profiles
  // Mutations for auto-linking and manual linking
  // Automatic logic for single vs multiple profiles
  // Modal management for profile selection
}
```

### Key Features

1. **Automatic Status Detection**
   - Queries premium status on wallet connection
   - Updates global state based on status

2. **Automatic Linking Logic**
   - Single profile: Auto-links immediately
   - Multiple profiles: Shows selection modal

3. **Profile Selection Modal**
   - Displays all available profiles
   - Clear warning about permanent linking
   - Handles loading states and errors

4. **State Management**
   - Integrates with Zustand store
   - Persists premium status across sessions
   - Handles error states gracefully

### Integration Points

#### 1. PremiumProvider
```typescript
const PremiumProvider = ({ children }) => {
  const { ProfileSelectionModal } = useInitPremium();
  
  return (
    <>
      {children}
      <ProfileSelectionModal />
    </>
  );
};
```

#### 2. Zustand Store
```typescript
interface PremiumState {
  userStatus: "Standard" | "OnChainUnlinked" | "ProLinked";
  linkedProfile: {
    profileId: string;
    handle: string;
    linkedAt: Date;
  } | null;
  // ... other state
}
```

## Error Handling

### Backend Errors
- Contract connection failures
- Database transaction failures
- Invalid profile ownership
- Already linked profiles

### Frontend Errors
- Network failures
- Invalid responses
- User cancellation
- Loading timeouts

## Security Considerations

1. **Permanent Linking**: Once a profile is linked, it cannot be changed
2. **Profile Ownership**: Only profiles owned by the wallet can be linked
3. **Premium Verification**: All operations require premium status verification
4. **Transaction Safety**: Database operations use transactions to prevent race conditions

## Testing

### Backend Tests
- `PremiumService.test.ts` covers all core functionality
- Tests for `verifyPremiumByNodeset`, linking logic, and error cases
- Mocked dependencies for isolated testing

### Frontend Tests
- Hook testing for `useInitPremium`
- Component testing for `ProfileSelectionModal`
- Integration testing for the complete flow

## Usage Examples

### Basic Integration
```typescript
// In your app root
import PremiumProvider from '@/components/Premium/PremiumProvider';

function App() {
  return (
    <PremiumProvider>
      <YourApp />
    </PremiumProvider>
  );
}
```

### Custom Usage
```typescript
import { useInitPremium } from '@/hooks/useInitPremium';

function MyComponent() {
  const { 
    isLoading, 
    premiumStatus, 
    ProfileSelectionModal 
  } = useInitPremium();

  if (isLoading) return <Loading />;
  
  return (
    <div>
      <p>Status: {premiumStatus?.userStatus}</p>
      <ProfileSelectionModal />
    </div>
  );
}
```

## Environment Variables

Required environment variables for the backend:

```env
REFERRAL_CONTRACT_ADDRESS=0x...
BALANCED_GAME_VAULT_ADDRESS=0x...
UNBALANCED_GAME_VAULT_ADDRESS=0x...
INFURA_URL=https://arbitrum-mainnet.infura.io/v3/...
```

## Future Enhancements

1. **Profile Unlinking**: Currently blocked, could be added with admin approval
2. **Multiple Premium Profiles**: Support for linking multiple profiles
3. **Premium Transfer**: Allow transferring premium status between wallets
4. **Analytics**: Track premium linking patterns and success rates

## Troubleshooting

### Common Issues

1. **Profile not found**: Ensure the profile exists in Lens and is owned by the wallet
2. **Already linked**: Check if the wallet or profile is already linked
3. **Not premium**: Verify the wallet is registered in the NodeSet contract
4. **Network errors**: Check Infura connection and contract addresses

### Debug Endpoints

- `GET /api/premium/wallet-status?walletAddress=0x...` - Check wallet premium status
- `GET /api/premium/linked-profile` - Get current linked profile
- `GET /api/premium/stats` - Get premium statistics

## Conclusion

This implementation provides a robust, secure, and user-friendly premium profile linking system that enforces business rules while maintaining a smooth user experience. The permanent linking ensures consistency and prevents abuse, while the automatic logic reduces friction for users with single profiles. 