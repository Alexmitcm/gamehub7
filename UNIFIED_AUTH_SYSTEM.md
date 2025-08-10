# 🔐 Unified Authentication System
## **Simplified Premium Registration & Login Flow**

### **🎯 Overview**

The Hey Pro authentication system has been completely refactored to provide a **unified, simplified experience** for both new user onboarding and existing user login. The complex multi-status logic has been replaced with a clean, two-state system.

---

## **📋 Core Principles**

### **Simplified User States**
- ✅ **STANDARD** - Regular user without premium features
- ✅ **PREMIUM** - User with premium status and linked profile

### **Unified Logic**
- **Single Endpoint**: `POST /api/auth/login` handles both registration and login
- **Automatic Profile Linking**: First Lens profile becomes permanent premium profile
- **On-Chain Verification**: Real-time blockchain status checking
- **JWT Integration**: Token contains user status and linked profile ID

---

## **🏗️ Architecture**

### **Service Layer**
```
AuthService
├── loginOrOnboard() - Unified login/registration
├── handleNewUserRegistration() - New user flow
├── handleExistingUserLogin() - Existing user flow
├── handlePremiumUpgrade() - Status upgrade logic
├── getUserProfile() - Profile retrieval
├── updateUserProfile() - Profile updates
├── validateToken() - JWT validation
└── getAvailableProfiles() - Profile listing
```

### **Database Schema**
```sql
-- Simplified User table
CREATE TABLE "User" (
  "walletAddress" TEXT PRIMARY KEY,
  "status" "UserStatus" DEFAULT 'Standard', -- Only Standard or Premium
  "linkedProfileId" TEXT, -- Permanent profile link
  -- ... other fields
);

-- Premium Profile linking
CREATE TABLE "PremiumProfile" (
  "walletAddress" TEXT UNIQUE,
  "profileId" TEXT UNIQUE,
  "linkedAt" TIMESTAMP,
  "isActive" BOOLEAN
);
```

---

## **🚀 API Endpoints**

### **1. Unified Login/Registration**
```http
POST /api/auth/login
Content-Type: application/json

{
  "walletAddress": "0x960FCeED1a0AC2Cc22e6e7Bd6876ca527d31D268",
  "selectedProfileId": "0x1234..."
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "walletAddress": "0x960FCeED1a0AC2Cc22e6e7Bd6876ca527d31D268",
    "status": "Premium",
    "linkedProfileId": "0x1234...",
    "email": "user@example.com",
    "username": "username",
    "displayName": "Display Name",
    "avatarUrl": "https://...",
    "registrationDate": "2024-05-25T10:30:00Z",
    "lastActiveAt": "2024-08-06T09:40:00Z",
    "totalLogins": 5
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isNewUser": false,
  "message": "Login successful"
}
```

### **2. Get User Profile**
```http
GET /api/auth/profile?walletAddress=0x960FCeED1a0AC2Cc22e6e7Bd6876ca527d31D268
```

### **3. Update User Profile**
```http
PUT /api/auth/profile?walletAddress=0x960FCeED1a0AC2Cc22e6e7Bd6876ca527d31D268
Content-Type: application/json

{
  "email": "newemail@example.com",
  "displayName": "New Display Name",
  "bio": "Updated bio"
}
```

### **4. Get Available Profiles**
```http
GET /api/auth/profiles?walletAddress=0x960FCeED1a0AC2Cc22e6e7Bd6876ca527d31D268
```

### **5. Validate JWT Token**
```http
POST /api/auth/validate
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## **🔄 User Flow Logic**

### **New User Registration**
```
1. User connects wallet
2. User selects Lens profile
3. POST /api/auth/login
4. Check if user exists → NO
5. Check on-chain premium status
6. Create user record with status (Standard/Premium)
7. If Premium: Create permanent profile link
8. Generate JWT with status and linkedProfileId
9. Return user data and token
```

### **Existing User Login**
```
1. User connects wallet
2. User selects Lens profile
3. POST /api/auth/login
4. Check if user exists → YES
5. Update activity (lastActiveAt, totalLogins)
6. Check on-chain premium status
7. If Standard → Premium upgrade: Update status and link profile
8. Generate JWT with current status and linkedProfileId
9. Return user data and token
```

### **Premium Status Upgrade**
```
1. User was Standard, now Premium on-chain
2. No linked profile exists
3. Validate selected profile ownership
4. Update user status to Premium
5. Create permanent profile link
6. Emit premium upgrade event
7. Update JWT with new status
```

---

## **🔐 JWT Token Structure**

### **Token Payload**
```json
{
  "walletAddress": "0x960FCeED1a0AC2Cc22e6e7Bd6876ca527d31D268",
  "status": "Premium",
  "linkedProfileId": "0x1234...",
  "iat": 1733568000,
  "exp": 1734172800,
  "iss": "hey-pro-api",
  "aud": "hey-pro-client"
}
```

### **Token Features**
- **7-day expiration** for convenience
- **Issuer/Audience validation** for security
- **User status included** for immediate UI rendering
- **Linked profile ID** for premium features
- **Automatic refresh** capability

---

## **📊 Business Logic**

### **Profile Linking Rules**
1. **First Profile Wins**: First Lens profile selected becomes permanent
2. **Permanent Link**: Once linked, profile cannot be changed
3. **Premium Only**: Only premium users get profile linking
4. **Ownership Validation**: Profile must be owned by the wallet

### **Status Determination**
1. **On-Chain Check**: Real-time blockchain verification
2. **Database Sync**: Local status matches on-chain status
3. **Automatic Upgrade**: Standard users become Premium when eligible
4. **Persistent State**: Status persists across sessions

### **Error Handling**
- **Invalid Wallet**: 400 Bad Request
- **Invalid Profile**: 400 Bad Request
- **Profile Not Owned**: 400 Bad Request
- **User Not Found**: 404 Not Found
- **Authentication Failed**: 500 Internal Server Error

---

## **🎯 Frontend Integration**

### **Login Flow**
```typescript
// 1. Connect wallet and get profiles
const profiles = await getAvailableProfiles(walletAddress);

// 2. User selects profile
const selectedProfile = profiles[0]; // First profile

// 3. Call unified login endpoint
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress,
    selectedProfileId: selectedProfile.id
  })
});

const { user, token, isNewUser } = await response.json();

// 4. Store token and user data
localStorage.setItem('authToken', token);
setUser(user);

// 5. Render UI based on status
if (user.status === 'Premium') {
  renderPremiumUI();
} else {
  renderStandardUI();
}
```

### **Token Validation**
```typescript
// Validate token on app startup
const token = localStorage.getItem('authToken');
if (token) {
  const response = await fetch('/api/auth/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  
  if (response.ok) {
    const { profile } = await response.json();
    setUser(profile);
  } else {
    // Token invalid, redirect to login
    localStorage.removeItem('authToken');
    redirectToLogin();
  }
}
```

---

## **🔧 Implementation Details**

### **Database Migration**
```sql
-- Migration: 20250115000001_simplify_user_status
-- Converts old multi-status system to simplified two-state system

-- 1. Create new UserStatus enum
CREATE TYPE "UserStatus" AS ENUM ('Standard', 'Premium');

-- 2. Add new status column
ALTER TABLE "User" ADD COLUMN "status" "UserStatus" DEFAULT 'Standard';

-- 3. Migrate existing data
UPDATE "User" SET "status" = 
  CASE 
    WHEN "premiumStatus" = 'ProLinked' THEN 'Premium'
    ELSE 'Standard'
  END;

-- 4. Drop old column and enum
ALTER TABLE "User" DROP COLUMN "premiumStatus";
DROP TYPE "PremiumStatus";
```

### **Service Dependencies**
```typescript
// AuthService dependencies
- BlockchainService: On-chain status verification
- ProfileService: Lens profile validation
- EventService: Event emission for analytics
- JwtService: Token generation and validation
- Prisma: Database operations
```

### **Event Types**
```typescript
// Events emitted by AuthService
- "user.registered": New user created
- "user.premium.upgraded": User upgraded to premium
- "user.login": User logged in
- "profile.linked": Profile permanently linked
```

---

## **✅ Benefits**

### **For Users**
- **Simplified Experience**: Single endpoint for login/registration
- **Immediate Access**: JWT contains all necessary user data
- **Automatic Upgrades**: Premium status updates automatically
- **Permanent Linking**: No need to re-link profiles

### **For Developers**
- **Clean API**: Single endpoint with clear logic
- **Type Safety**: Full TypeScript support
- **Error Handling**: Comprehensive error responses
- **Event-Driven**: Easy integration with other systems

### **For Business**
- **Reduced Friction**: Streamlined onboarding process
- **Better Analytics**: Event-driven tracking
- **Scalable**: Modular architecture for growth
- **Maintainable**: Simplified codebase

---

## **🚀 Deployment**

### **Environment Variables**
```bash
# Required
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=postgresql://...
INFURA_URL=https://arbitrum-mainnet.infura.io/v3/...

# Optional
PORT=3008
NODE_ENV=production
```

### **Database Setup**
```bash
# 1. Run migrations
npx prisma migrate deploy

# 2. Generate Prisma client
npx prisma generate

# 3. Verify schema
npx prisma db push --preview-feature
```

### **Testing**
```bash
# Test the unified login endpoint
curl -X POST http://localhost:3008/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x960FCeED1a0AC2Cc22e6e7Bd6876ca527d31D268",
    "selectedProfileId": "0x1234..."
  }'
```

---

## **🎉 Conclusion**

The unified authentication system provides a **clean, simple, and powerful** solution for Hey Pro's user management needs. By eliminating complex multi-status logic and implementing a unified login/registration flow, we've created a system that is:

✅ **User-Friendly**: Simple, intuitive experience  
✅ **Developer-Friendly**: Clean API with comprehensive documentation  
✅ **Business-Ready**: Scalable, maintainable, and feature-rich  
✅ **Future-Proof**: Event-driven architecture for easy extensions  

**The system is now ready for production deployment and will provide an excellent foundation for Hey Pro's growth! 🚀** 