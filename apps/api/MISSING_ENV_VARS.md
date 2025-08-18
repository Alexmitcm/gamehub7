# Missing Environment Variables Causing 500 Error

## Problem
The `/auth/sync-lens` endpoint is returning a 500 Internal Server Error because several required environment variables are missing from the Railway deployment.

## Root Cause
Multiple services use `getRequiredEnvVar()` which throws an error during service initialization if environment variables are not set:

1. **SimplePremiumService** - requires `REFERRAL_CONTRACT_ADDRESS` and `INFURA_URL`
2. **BlockchainService** - requires multiple contract addresses and `INFURA_URL`
3. **PremiumRegistrationService** - requires `REFERRAL_CONTRACT_ADDRESS` and `INFURA_URL`
4. **NewPremiumRegistrationService** - requires multiple contract addresses and `PRIVATE_KEY`
5. **LensProfileService** - requires `LENS_API_URL` and `NEXT_PUBLIC_LENS_NETWORK`

## Missing Environment Variables

### Required (causes 500 error if missing):
```bash
# Blockchain Configuration
REFERRAL_CONTRACT_ADDRESS="0x..."  # Required by SimplePremiumService, BlockchainService, PremiumRegistrationService
INFURA_URL="https://arbitrum-mainnet.infura.io/v3/your-key"  # Required by multiple services
BALANCED_GAME_VAULT_ADDRESS="0x..."  # Required by BlockchainService
UNBALANCED_GAME_VAULT_ADDRESS="0x..."  # Required by BlockchainService
USDT_CONTRACT_ADDRESS="0x..."  # Required by BlockchainService, NewPremiumRegistrationService
PRIVATE_KEY="0x..."  # Required by NewPremiumRegistrationService

# Lens Protocol Configuration
LENS_API_URL="https://api.lens.dev"  # Required by LensProfileService
NEXT_PUBLIC_LENS_NETWORK="mainnet"  # Required by LensProfileService

# JWT Configuration
JWT_SECRET="your-jwt-secret-key"  # Required by JwtService, PremiumService
```

### Optional (has fallbacks):
```bash
# These have fallback values but should be set for production
POLYGON_RPC_URL="https://polygon-rpc.com"
REDIS_URL="redis://localhost:6379"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-s3-bucket"
```

## Solution

### Step 1: Add Missing Environment Variables to Railway
Go to your Railway project dashboard and add these environment variables:

1. **REFERRAL_CONTRACT_ADDRESS** - The address of your referral contract
2. **INFURA_URL** - Your Infura endpoint for Arbitrum
3. **BALANCED_GAME_VAULT_ADDRESS** - The balanced game vault contract address
4. **UNBALANCED_GAME_VAULT_ADDRESS** - The unbalanced game vault contract address
5. **USDT_CONTRACT_ADDRESS** - The USDT contract address
6. **PRIVATE_KEY** - Your private key for contract interactions
7. **LENS_API_URL** - Lens API endpoint (usually "https://api.lens.dev")
8. **NEXT_PUBLIC_LENS_NETWORK** - Lens network (usually "mainnet")
9. **JWT_SECRET** - A secure random string for JWT signing

### Step 2: Redeploy the Application
After adding the environment variables, redeploy your Railway application.

### Step 3: Test the Endpoint
Test the sync-lens endpoint:
```bash
curl -X POST https://gamehub7-production.up.railway.app/auth/sync-lens \
  -H "Content-Type: application/json" \
  -d '{"lensAccessToken": "your-lens-token"}'
```

## Alternative Solution: Make Environment Variables Optional

If you want to make the application more resilient to missing environment variables, you can modify the services to use fallback values instead of throwing errors. However, this is not recommended for production as it may cause unexpected behavior.

## Current Error Flow
1. Frontend calls `/auth/sync-lens`
2. Route handler calls `AuthService.syncLens()`
3. `AuthService.syncLens()` calls `SimplePremiumService.isPremiumWallet()`
4. `SimplePremiumService` constructor tries to get `REFERRAL_CONTRACT_ADDRESS` and `INFURA_URL`
5. `getRequiredEnvVar()` throws an error because variables are missing
6. Service initialization fails
7. 500 error is returned to frontend

## Verification
After adding the environment variables, the sync-lens endpoint should work correctly and return a 200 status with the user authentication data.
