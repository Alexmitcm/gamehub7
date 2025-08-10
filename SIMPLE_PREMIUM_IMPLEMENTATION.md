# ✅ Simple Premium Profile Linking Implementation

This document describes the **simplified** Premium profile linking implementation that follows the exact specification from the prompt.

## 🎯 Overview

**Business Logic**: On user login, check if the wallet is premium (in NodeSet contract). If premium and no profile is linked, auto-link the current profile permanently.

## 🔐 Backend Implementation

### Core Service: `SimplePremiumService`

```typescript
// Key Methods:
1. isPremiumWallet(walletAddress) - Check NodeSet contract
2. getPremiumStatus(walletAddress, profileId?) - Get status + auto-link
3. linkProfile(walletAddress, profileId) - Permanent linking
```

### API Endpoint: `POST /api/premium/simple-status`

**Request:**
```json
{
  "walletAddress": "0x...",
  "profileId": "lens-abc" // Optional
}
```

**Response:**
```json
{
  "data": {
    "userStatus": "Standard" | "ProLinked",
    "linkedProfile": {
      "profileId": "lens-abc",
      "linkedAt": "2024-01-01T00:00:00Z"
    }
  },
  "status": "Success"
}
```

### Business Logic Flow

1. **User Login** → Check `walletAddress` against NodeSet contract
2. **If not premium** → Return `{ userStatus: "Standard" }`
3. **If premium**:
   - Check `PremiumProfile` table
   - If already linked → Return `userStatus: "ProLinked"` + linked profile
   - If not linked + `profileId` provided → Auto-link permanently
   - Return `userStatus: "ProLinked"` + linked profile

## 💻 Frontend Implementation

### Core Hook: `useSimplePremium`

```typescript
const { isLoading, isPremium, linkedProfile } = useSimplePremium();
```

**Features:**
- ✅ Calls `POST /api/premium/simple-status` on app startup
- ✅ Auto-links current profile if wallet is premium
- ✅ Updates global Zustand state
- ✅ Caches result for 5 minutes

### Provider: `SimplePremiumProvider`

```typescript
// Wrap your app
<SimplePremiumProvider>
  <YourApp />
</SimplePremiumProvider>
```

### Premium Badge: `PremiumBadge`

```typescript
// Use in wallet selector
<PremiumBadge walletAddress={address} />
// Shows: "✔️ Premium" badge
```

## 🚀 Usage Examples

### 1. Basic Integration

```typescript
// In your app root
import SimplePremiumProvider from '@/components/Premium/SimplePremiumProvider';

function App() {
  return (
    <SimplePremiumProvider>
      <YourApp />
    </SimplePremiumProvider>
  );
}
```

### 2. Wallet Selector with Premium Badge

```typescript
import PremiumBadge from '@/components/Premium/PremiumBadge';

function WalletSelector() {
  return (
    <div className="wallet-option">
      <span>{walletAddress}</span>
      <PremiumBadge walletAddress={walletAddress} />
    </div>
  );
}
```

### 3. Custom Premium Logic

```typescript
import { useSimplePremium } from '@/hooks/useSimplePremium';

function MyComponent() {
  const { isPremium, linkedProfile } = useSimplePremium();
  
  if (isPremium) {
    return <div>Premium features unlocked!</div>;
  }
  
  return <div>Standard user</div>;
}
```

## 📊 Example Flow

### Scenario: User A becomes Premium

1. **User A registers** in Referral smart contract (NodeSet)
2. **Later logs in** with wallet A and connects to `profileId: lens-abc`
3. **Backend auto-links** lens-abc to wallet A permanently
4. **From now on**:
   - Every login shows: `userStatus: "ProLinked"`
   - Wallet selector shows: "✔️ Premium" next to wallet A
   - Premium features unlocked

### Scenario: Standard User

1. **User B logs in** with wallet B
2. **Backend checks** NodeSet contract → not found
3. **Returns**: `userStatus: "Standard"`
4. **No premium features** available

## 🔧 Environment Variables

Required in your `.env` file:

```env
REFERRAL_CONTRACT_ADDRESS=0x...
INFURA_URL=https://arbitrum-mainnet.infura.io/v3/...
```

## 🧪 Testing

### Test the API directly:

```bash
curl -X POST http://localhost:3003/api/premium/simple-status \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x...",
    "profileId": "lens-abc"
  }'
```

### Test the debug endpoint:

```bash
curl -X POST http://localhost:3003/api/premium/debug \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x..."}'
```

## 📁 File Structure

```
apps/api/src/
├── services/
│   └── SimplePremiumService.ts     # Core premium logic
├── routes/premium/
│   ├── simple-status.ts            # API endpoint
│   └── debug-status.ts             # Debug endpoint

apps/web/src/
├── hooks/
│   └── useSimplePremium.tsx        # Frontend hook
├── components/Premium/
│   ├── SimplePremiumProvider.tsx   # App provider
│   └── PremiumBadge.tsx            # UI badge
└── helpers/
    └── fetcher.ts                  # API client
```

## ✅ Key Features

- **Simple & Clean**: Only 2 statuses: "Standard" | "ProLinked"
- **Auto-linking**: Premium wallets automatically link current profile
- **Permanent**: Once linked, cannot be changed
- **Cached**: 5-minute cache for performance
- **Error-safe**: Defaults to "Standard" on errors
- **Type-safe**: Full TypeScript support

## 🎯 Success Criteria

✅ **Backend**: Check NodeSet contract on login  
✅ **Backend**: Auto-link current profile if premium  
✅ **Backend**: Return simple status format  
✅ **Frontend**: Cache premium status  
✅ **Frontend**: Show premium badge in wallet selector  
✅ **Frontend**: Update global state  

## 🚀 Ready to Use

The implementation is complete and follows the exact specification from your prompt. Simply:

1. Set environment variables
2. Wrap your app with `SimplePremiumProvider`
3. Use `PremiumBadge` in wallet selector
4. Use `useSimplePremium()` for custom logic

**That's it!** 🎉 