# Deployment Checklist

## 🚀 Railway (Backend API) Deployment

### ✅ Configuration Files
- [x] `railway.json` - Configured for Nixpacks with API-specific commands
- [x] `package.json` (root) - Build/start scripts point to API
- [x] `apps/api/package.json` - All dependencies and scripts configured
- [x] `apps/api/env.d.ts` - Environment variable types defined

### 🔧 Required Environment Variables (Set in Railway Dashboard)
```
DATABASE_URL=postgresql://...
LENS_DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_KEY=...
NEXT_PUBLIC_LENS_NETWORK=mainnet
PRIVATE_KEY=...
SHARED_SECRET=...
REFERRAL_CONTRACT_ADDRESS=...
BALANCED_GAME_VAULT_ADDRESS=...
UNBALANCED_GAME_VAULT_ADDRESS=...
VIP_VAULT_ADDRESS=...
DEFAULT_LENS_HANDLE=...
USDT_CONTRACT_ADDRESS=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
INFURA_URL=...
JWT_SECRET=...
```

### 📋 Deployment Steps
1. Connect Railway to GitHub repository: `https://github.com/Alexmitcm/defigame.git`
2. Set all environment variables in Railway dashboard
3. Deploy will use Nixpacks with commands:
   - Build: `cd apps/api && pnpm install && pnpm codegen`
   - Start: `cd apps/api && tsx src/index.ts`
4. Health check: `/ping` endpoint

## 🌐 Netlify (Frontend) Deployment

### ✅ Configuration Files
- [x] `apps/web/netlify.toml` - Build and environment configuration
- [x] `apps/web/vite.config.mjs` - Vite build configuration
- [x] `apps/web/package.json` - All dependencies and build scripts
- [x] `apps/web/.env` - Local environment variables

### 🔧 Environment Variables (Set in Netlify Dashboard)
```
VITE_IS_PRODUCTION=true
VITE_API_URL=https://defigame-production.up.railway.app
NEXT_PUBLIC_LENS_NETWORK=mainnet
VITE_WALLETCONNECT_PROJECT_ID=cd542acc70c2b548030f9901a52e70c8
```

### 📋 Deployment Steps
1. Connect Netlify to GitHub repository: `https://github.com/Alexmitcm/defigame.git`
2. Set build settings:
   - Build command: `pnpm build`
   - Publish directory: `apps/web/dist`
3. Set environment variables in Netlify dashboard
4. Deploy will build the web app with proper API URL

## 🔗 Cross-Service Configuration

### ✅ API Endpoints
- [x] Root endpoint: `/` - API information
- [x] Health check: `/ping` - Service status
- [x] Auth: `/auth/*` - Authentication endpoints
- [x] Preferences: `/preferences/get` - User preferences
- [x] Lens: `/lens/*` - Lens Protocol integration

### ✅ Frontend Integration
- [x] Web3 providers configured (WalletConnect, MetaMask)
- [x] API client configured for new Railway URL
- [x] Error handling and health monitoring
- [x] Environment-specific configurations

## 🧪 Pre-Deployment Tests

### Backend Tests
- [ ] Test database connection
- [ ] Test Prisma client generation
- [ ] Test API endpoints locally
- [ ] Verify environment variables

### Frontend Tests
- [ ] Test build process locally
- [ ] Test Web3 connections
- [ ] Test API integration
- [ ] Verify environment variables

## 🚨 Post-Deployment Verification

### Railway API
- [ ] Health check: `https://defigame-production.up.railway.app/ping`
- [ ] Root endpoint: `https://defigame-production.up.railway.app/`
- [ ] Database connection working
- [ ] All environment variables set

### Netlify Frontend
- [ ] Site loads correctly
- [ ] Web3 connections work
- [ ] API calls succeed
- [ ] No console errors

## 📝 Notes
- Railway will use Nixpacks builder (no Docker)
- Netlify will build from monorepo root
- Both services use the new repository: `https://github.com/Alexmitcm/defigame.git`
- API URL updated to: `https://defigame-production.up.railway.app`
