# Railway Backend Deployment Guide

## 🚨 Current Status

**DIAGNOSIS**: Your Railway backend is not deployed or the application name has changed.

**EVIDENCE**:
- ✅ Railway infrastructure is working (`railway-edge` server responding)
- ✅ DNS resolution is working (66.33.22.9)
- ❌ Application `defigame-production` returns 404 "Application not found"

## 🚀 Deployment Steps

### Step 1: Install Railway CLI

```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Or using pnpm
pnpm add -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

### Step 3: Initialize Railway Project

```bash
# Navigate to your API directory
cd apps/api

# Initialize Railway project
railway init

# This will create a new project or link to existing one
```

### Step 4: Configure Environment Variables

Set these environment variables in Railway dashboard:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Application
NODE_ENV="production"
PORT="8080"

# JWT
JWT_SECRET="your-secure-jwt-secret"

# Admin Configuration
ADMIN_WALLET_ADDRESSES="0x1234567890abcdef1234567890abcdef12345678"

# Optional: Supabase (if using)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Optional: Blockchain
INFURA_URL="https://mainnet.infura.io/v3/your-infura-key"
POLYGON_RPC_URL="https://polygon-rpc.com"

# Optional: Lens Protocol
LENS_API_URL="https://api.lens.dev"
LENS_NETWORK="mainnet"
```

### Step 5: Deploy to Railway

```bash
# Deploy the application
railway up

# Or deploy and watch logs
railway up --watch
```

### Step 6: Run Database Migrations

```bash
# Access Railway shell
railway shell

# Run migrations
npx prisma migrate deploy --schema=src/prisma/schema.prisma

# Generate Prisma client
npx prisma generate --schema=src/prisma/schema.prisma
```

### Step 7: Setup Admin System

```bash
# In Railway shell
npx tsx scripts/setup-admin-simple.ts
```

### Step 8: Get Your New URL

```bash
# Get the deployment URL
railway status

# Or check the Railway dashboard
```

## 🧪 Testing Your Deployment

### Quick Test
```bash
# Test basic connectivity
node quick-railway-test.mjs

# Run comprehensive test
node test-railway-connection.mjs

# Run diagnostic
node railway-diagnostic.mjs
```

### Manual Testing
```bash
# Health check
curl https://your-new-railway-url.up.railway.app/ping

# Admin stats
curl https://your-new-railway-url.up.railway.app/admin/stats
```

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs
   railway logs
   
   # Ensure all dependencies are installed
   pnpm install
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connection
   npx prisma db pull --schema=src/prisma/schema.prisma
   
   # Check DATABASE_URL in Railway variables
   railway variables
   ```

3. **Port Issues**
   - Ensure your app uses `process.env.PORT`
   - Railway automatically sets PORT=8080

4. **Environment Variables**
   ```bash
   # List all variables
   railway variables
   
   # Set a variable
   railway variables set DATABASE_URL="your-db-url"
   ```

### Useful Commands

```bash
# View logs
railway logs

# Check status
railway status

# Access shell
railway shell

# List variables
railway variables

# Redeploy
railway up

# Link to existing project
railway link

# Open in browser
railway open
```

## 📊 Monitoring

### Railway Dashboard
- Visit https://railway.app
- Check deployment status
- Monitor logs in real-time
- View environment variables

### Health Checks
- Set up monitoring for your endpoints
- Use the test scripts to verify functionality
- Monitor response times and error rates

## 🔄 Continuous Deployment

### GitHub Integration
1. Connect your GitHub repository to Railway
2. Enable automatic deployments on push
3. Configure deployment branches

### Environment Management
- Use different environments for staging/production
- Set up environment-specific variables
- Test deployments in staging first

## 📝 Next Steps

1. **Deploy the application** using the steps above
2. **Update your frontend** to use the new Railway URL
3. **Set up monitoring** and health checks
4. **Configure CI/CD** for automatic deployments
5. **Set up backups** for your database

## 🆘 Getting Help

- **Railway Documentation**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app

---

**Note**: The current URL `https://defigame-production.up.railway.app` appears to be from an old or removed deployment. You'll need to create a new deployment with a new URL.
