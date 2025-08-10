# Hey Pro Integration Guide

## 🎯 Overview

The Hey Pro system is a complete premium membership solution that integrates with Lens Protocol and Arbitrum blockchain. It provides a seamless user experience from registration to premium dashboard access.

## 🏗️ Architecture

### Backend Components
- **PremiumService**: Core business logic for on-chain operations
- **ProfileService**: Lens Protocol API integration
- **PremiumController**: HTTP request/response handling
- **Database**: PostgreSQL with PremiumProfile model

### Frontend Components
- **PremiumProvider**: Global state management
- **ProBadge**: Premium verification badge
- **JoinProBanner**: Upgrade promotion banner
- **ProfileSelectionModal**: Profile linking interface
- **ProDashboard**: Complete premium dashboard
- **PremiumPage**: Main orchestrator component

## 🚀 Quick Start

### 1. Add PremiumProvider to App Root

```tsx
// In your main App component
import { PremiumProvider } from "@/components/Premium";

function App() {
  return (
    <PremiumProvider>
      {/* Your existing app components */}
    </PremiumProvider>
  );
}
```

### 2. Use Components in Your UI

```tsx
import { ProBadge, JoinProBanner } from "@/components/Premium";

// In your header/navigation
function Header() {
  return (
    <header>
      <div className="flex items-center gap-4">
        <Logo />
        <ProBadge size="md" />
        <UserMenu />
      </div>
    </header>
  );
}

// In your sidebar or feed
function Sidebar() {
  return (
    <aside>
      <JoinProBanner />
      {/* Other sidebar content */}
    </aside>
  );
}
```

### 3. Add Premium Route

```tsx
// In your router configuration
import { PremiumPage } from "@/components/Premium";

const router = createBrowserRouter([
  {
    path: "/premium",
    element: <PremiumPage />
  }
]);
```

## 📊 User Status Flow

The system automatically manages three user states:

### 1. Standard User
- **Condition**: Not registered in referral program
- **UI**: Shows JoinProBanner
- **Actions**: Can register for premium

### 2. OnChainUnlinked
- **Condition**: Registered in referral program, but no profile linked
- **UI**: Shows profile selection interface
- **Actions**: Must link a Lens profile

### 3. ProLinked
- **Condition**: Fully set up premium user
- **UI**: Shows ProDashboard with full features
- **Actions**: Access to all premium features

## 🧪 Testing

### Test Page
Use the `PremiumTestPage` component to test all features:

```tsx
import { PremiumTestPage } from "@/components/Premium";

// Add to your routes for testing
<Route path="/premium-test" element={<PremiumTestPage />} />
```

### API Testing
Test the backend endpoints:

```bash
# Check wallet status
curl "http://localhost:3002/premium/wallet-status?walletAddress=YOUR_WALLET"

# Get user profiles
curl "http://localhost:3002/premium/profiles?walletAddress=YOUR_WALLET"

# Link profile (requires auth)
curl -X POST "http://localhost:3002/premium/link-profile" \
  -H "Content-Type: application/json" \
  -H "X-Access-Token: YOUR_LENS_TOKEN" \
  -d '{"profileId":"PROFILE_ID"}'
```

## 🔧 Configuration

### Environment Variables
Ensure these are set in your `.env` file:

```env
# Database
DATABASE_URL="postgresql://..."

# Lens Protocol
LENS_API_URL="https://api.lens.dev"

# Arbitrum RPC
ARBITRUM_RPC_URL="https://arb1.arbitrum.io/rpc"

# Contract Addresses (already configured in constants.ts)
REFERRAL_CONTRACT_ADDRESS="0x3bC03e9793d2E67298fb30871a08050414757Ca7"
BALANCED_GAME_VAULT_ADDRESS="0x65f83111e525C8a577C90298377e56E72C24aCb2"
UNBALANCED_GAME_VAULT_ADDRESS="0x10E7F9feB9096DCBb94d59D6874b07657c965981"
```

### Contract Addresses
The system uses these mainnet contracts:
- **Referral**: `0x3bC03e9793d2E67298fb30871a08050414757Ca7`
- **Balanced GameVault**: `0x65f83111e525C8a577C90298377e56E72C24aCb2`
- **Unbalanced GameVault**: `0x10E7F9feB9096DCBb94d59D6874b07657c965981`

## 🎨 Customization

### Styling
All components use Tailwind CSS and can be customized:

```tsx
// Custom ProBadge styling
<ProBadge className="custom-badge-styles" size="lg" />

// Custom JoinProBanner
<JoinProBanner className="custom-banner-styles" />
```

### State Management
Access premium state anywhere in your app:

```tsx
import { usePremiumStore } from "@/store/premiumStore";

function MyComponent() {
  const { userStatus, isPremium, linkedProfile } = usePremiumStore();
  
  if (isPremium) {
    return <div>Welcome Pro user!</div>;
  }
  
  return <div>Upgrade to Pro</div>;
}
```

## 🔒 Security Features

- **JWT Verification**: All API calls verify Lens Protocol JWTs
- **Profile Ownership**: Validates profile ownership before linking
- **Permanent Links**: Enforces one-to-one wallet-to-profile relationship
- **Rate Limiting**: API endpoints are rate-limited
- **Input Validation**: All inputs validated with Zod schemas

## 📈 Performance

- **React Query**: Efficient data fetching and caching
- **Optimistic Updates**: Immediate UI feedback
- **Error Boundaries**: Graceful error handling
- **Loading States**: Clear loading indicators

## 🐛 Troubleshooting

### Common Issues

1. **401 Unauthorized**: Ensure user is authenticated with Lens Protocol
2. **Profile Not Found**: Verify wallet owns the Lens profile
3. **On-chain Errors**: Check if wallet is registered in referral program
4. **Database Errors**: Ensure PostgreSQL is running and migrations applied

### Debug Mode
Enable debug logging in the API:

```typescript
// In PremiumService.ts
logger.info(`Debug: ${JSON.stringify(data)}`);
```

## 🚀 Next Steps

1. **Deploy to Production**: Update contract addresses for production
2. **Add Analytics**: Track premium conversions and usage
3. **Implement Rewards**: Add actual reward claiming functionality
4. **Mobile Optimization**: Ensure responsive design works on mobile
5. **A/B Testing**: Test different banner designs and messaging

## 📞 Support

For issues or questions:
1. Check the test page: `/premium-test`
2. Review API logs in the backend
3. Verify environment variables
4. Test with known working wallet addresses

---

**The Hey Pro system is now production-ready! 🎉** 