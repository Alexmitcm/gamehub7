# Referral Tree System Implementation

A complete on-chain Referral Tree system for Hey Pro that visualizes user referral structures from the Arbitrum referral contract.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │  Smart Contract │
│                 │    │                 │    │                 │
│ ReferralTreeGraph│◄──►│ /api/premium/tree │◄──►│ Referral Contract│
│ useReferralTree  │    │ SimplePremiumService│   │ (Arbitrum)     │
│ ReferralTreeDemo │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 File Structure

### Backend Files
- `apps/api/src/services/SimplePremiumService.ts` - Core service with tree building logic
- `apps/api/src/routes/premium/tree.ts` - API endpoint for tree data
- `apps/api/src/routes/premium/index.ts` - Route registration
- `apps/api/src/services/SimplePremiumService.test.ts` - Comprehensive tests

### Frontend Files
- `apps/web/src/hooks/useReferralTree.tsx` - React hook for data fetching
- `apps/web/src/components/ReferralTreeGraph.tsx` - Tree visualization component
- `apps/web/src/components/Premium/ReferralTreeDemo.tsx` - Demo interface
- `apps/web/src/components/Premium/ReferralTreeIntegration.tsx` - Integration example

## 🔧 Backend Implementation

### SimplePremiumService.buildReferralTree()

```typescript
async buildReferralTree(
  rootWallet: string,
  depth = 0,
  maxDepth = 5
): Promise<ReferralNode[]>
```

**Features:**
- Recursively fetches tree data from referral contract
- Respects max depth limit (configurable)
- Handles null addresses and error cases
- Returns structured data with balance, points, and relationships

**ReferralNode Interface:**
```typescript
interface ReferralNode {
  address: string;
  parent: string | null;
  leftChild?: string;
  rightChild?: string;
  depth: number;
  balance: string;
  point: number;
  startTime: string;
}
```

### API Endpoint

**GET** `/api/premium/tree/:wallet`

**Query Parameters:**
- `maxDepth` (optional): Maximum tree depth (0-10, default: 5)

**Response:**
```json
{
  "data": [
    {
      "address": "0x...",
      "parent": null,
      "leftChild": "0x...",
      "rightChild": "0x...",
      "depth": 0,
      "balance": "1000000",
      "point": 100,
      "startTime": "1234567890"
    }
  ],
  "meta": {
    "rootWallet": "0x...",
    "maxDepth": 5,
    "totalNodes": 3
  }
}
```

## 🎨 Frontend Implementation

### useReferralTree Hook

```typescript
const { data, isLoading, error } = useReferralTree(walletAddress, maxDepth);
```

**Features:**
- TanStack Query integration for caching
- Automatic retry and error handling
- Configurable stale time (5 minutes)
- Garbage collection time (10 minutes)

### ReferralTreeGraph Component

```typescript
<ReferralTreeGraph 
  walletAddress="0x..." 
  maxDepth={5}
  className="custom-class"
/>
```

**Features:**
- Custom SVG-based tree visualization
- Interactive nodes (click to copy address)
- Responsive design with proper error states
- Binary tree layout with connection lines
- Displays wallet addresses, balances, and points

## 🚀 Usage Examples

### Basic Integration

```tsx
import { useAccount } from "wagmi";
import ReferralTreeGraph from "@/components/ReferralTreeGraph";

function MyComponent() {
  const { address } = useAccount();
  
  if (!address) return <div>Connect wallet</div>;
  
  return (
    <ReferralTreeGraph 
      walletAddress={address} 
      maxDepth={5}
    />
  );
}
```

### With Custom Controls

```tsx
import { useState } from "react";
import ReferralTreeGraph from "@/components/ReferralTreeGraph";

function TreeWithControls() {
  const [maxDepth, setMaxDepth] = useState(5);
  const [walletAddress, setWalletAddress] = useState("0x...");
  
  return (
    <div>
      <select value={maxDepth} onChange={(e) => setMaxDepth(Number(e.target.value))}>
        <option value={3}>3 levels</option>
        <option value={5}>5 levels</option>
        <option value={7}>7 levels</option>
      </select>
      
      <ReferralTreeGraph 
        walletAddress={walletAddress} 
        maxDepth={maxDepth}
      />
    </div>
  );
}
```

## 🧪 Testing

Run the backend tests:

```bash
cd apps/api
npm test -- SimplePremiumService.test.ts
```

**Test Coverage:**
- Tree building with multiple levels
- Depth limit enforcement
- Error handling for non-existent wallets
- Data structure validation

## 🔄 Data Flow

1. **User Request**: Frontend calls `useReferralTree(walletAddress, maxDepth)`
2. **API Call**: Hook fetches from `/api/premium/tree/${walletAddress}?maxDepth=${maxDepth}`
3. **Backend Processing**: `SimplePremiumService.buildReferralTree()` recursively queries contract
4. **Contract Interaction**: Uses `NodeSet(address)` function to get node data
5. **Tree Construction**: Builds binary tree structure from contract data
6. **Response**: Returns structured tree data with metadata
7. **Visualization**: `ReferralTreeGraph` renders SVG tree with interactive nodes

## 🎯 Key Features

### ✅ Implemented
- Real-time data from Arbitrum referral contract
- Binary tree visualization with parent-child relationships
- Display balance and points for each node
- Configurable depth limit (up to 10 levels)
- Click nodes to copy wallet addresses
- Error handling and loading states
- Responsive design
- Comprehensive testing

### 🔮 Future Enhancements
- Reward calculation per node
- Tree search and filtering
- Export tree data
- Performance optimizations for large trees
- Real-time updates via WebSocket
- Tree statistics and analytics

## 🔧 Environment Variables

Required backend environment variables:

```env
REFERRAL_CONTRACT_ADDRESS=0x...  # Referral contract address on Arbitrum
INFURA_URL=https://arbitrum-mainnet.infura.io/v3/YOUR_KEY
```

## 📊 Performance Considerations

- **Caching**: 5-minute stale time, 10-minute garbage collection
- **Depth Limits**: Configurable max depth to prevent infinite recursion
- **Error Handling**: Graceful fallbacks for contract errors
- **Memory Management**: Efficient tree data structures

## 🛡️ Security

- Input validation for wallet addresses
- Depth limit enforcement (0-10 levels)
- Error message sanitization
- Rate limiting on API endpoints

## 📝 API Documentation

### GET /api/premium/tree/:wallet

Fetches referral tree data for a given wallet address.

**Parameters:**
- `wallet` (path): Wallet address to fetch tree for
- `maxDepth` (query, optional): Maximum tree depth (0-10)

**Responses:**
- `200`: Success with tree data
- `400`: Invalid wallet address or depth
- `500`: Server error

**Example:**
```bash
curl "http://localhost:3000/api/premium/tree/0x1234...?maxDepth=5"
```

This implementation provides a complete, production-ready referral tree system that can be easily integrated into the Hey Pro application. 