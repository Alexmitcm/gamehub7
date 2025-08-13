# Railway Deployment Setup Guide

## 🚀 Railway Configuration

Your Railway deployment is configured to run on **port 8080** with the following setup:

### Current Railway Configuration
```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "runtime": "V2",
    "numReplicas": 1,
    "sleepApplication": false,
    "multiRegionConfig": {
      "europe-west4-drams3a": {
        "numReplicas": 1
      }
    },
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 🔧 Required Environment Variables

Set these environment variables in your Railway dashboard:

### Database Configuration
```bash
DATABASE_URL="postgresql://username:password@host:port/database"
```

### Railway Deployment
```bash
NODE_ENV="production"
PORT="8080"
RAILWAY_URL="https://defigame-production.up.railway.app"
```

### Supabase Configuration (if using Supabase)
```bash
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

### Blockchain Configuration
```bash
INFURA_URL="https://mainnet.infura.io/v3/your-infura-key"
POLYGON_RPC_URL="https://polygon-rpc.com"
```

### Lens Protocol Configuration
```bash
LENS_API_URL="https://api.lens.dev"
LENS_NETWORK="mainnet"
```

### JWT Configuration
```bash
JWT_SECRET="your-jwt-secret-key"
```

### Admin Configuration
```bash
ADMIN_WALLET_ADDRESSES="0x1234567890abcdef1234567890abcdef12345678,0x876543210fedcba9876543210fedcba9876543210"
```

## 📋 Setup Steps

### 1. Railway Dashboard Configuration

1. **Go to Railway Dashboard:**
   - Navigate to your project: `defigame-production`
   - Click on the "Variables" tab

2. **Add Environment Variables:**
   - Add all the required variables listed above
   - Make sure `DATABASE_URL` points to your Supabase database
   - Set `PORT=8080` (Railway default)

3. **Deploy the Application:**
   - Railway will automatically detect the changes
   - The build process will run: `pnpm --filter @hey/api build`
   - The start command will be: `pnpm --filter @hey/api start`

### 2. Database Migration

After deployment, you need to run database migrations:

1. **Access Railway Shell:**
   - Go to your Railway project
   - Click on "Deployments"
   - Find the latest deployment
   - Click "View Logs" or "Shell"

2. **Run Migrations:**
   ```bash
   npx prisma migrate deploy --schema=src/prisma/schema.prisma
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate --schema=src/prisma/schema.prisma
   ```

### 3. Admin System Setup

1. **Setup Admin Users:**
   ```bash
   npx tsx scripts/setup-admin-simple.ts
   ```

2. **Verify Setup:**
   ```bash
   node test-railway-deployment.js
   ```

## 🧪 Testing the Deployment

### Health Check
```bash
curl https://defigame-production.up.railway.app/ping
```

### Admin Endpoints
```bash
# Admin stats
curl https://defigame-production.up.railway.app/admin/stats

# Features
curl https://defigame-production.up.railway.app/admin/features

# Admin actions
curl https://defigame-production.up.railway.app/admin/actions

# Admin user info
curl "https://defigame-production.up.railway.app/admin/admin-user?walletAddress=0x1234567890abcdef1234567890abcdef12345678"
```

## 🔗 Frontend Configuration

Update your frontend to use the Railway API:

### Environment Variables for Frontend
```bash
VITE_API_URL="https://defigame-production.up.railway.app"
```

### Update API Base URL
In your frontend components, make sure they're pointing to the Railway URL instead of localhost.

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed:**
   - Check `DATABASE_URL` in Railway variables
   - Verify Supabase database is accessible
   - Run migrations: `npx prisma migrate deploy --schema=src/prisma/schema.prisma`

2. **Port Issues:**
   - Railway automatically sets `PORT=8080`
   - Make sure your app uses `process.env.PORT`

3. **Build Failures:**
   - Check Railway build logs
   - Ensure all dependencies are in `package.json`
   - Verify Prisma schema is valid

4. **Admin Endpoints Not Working:**
   - Run admin setup script
   - Check if admin users exist in database
   - Verify environment variables are set

### Debug Commands

```bash
# Check Railway logs
railway logs

# Access Railway shell
railway shell

# Check environment variables
railway variables

# Test database connection
npx prisma db pull --schema=src/prisma/schema.prisma
```

## 📊 Monitoring

### Railway Dashboard
- Monitor deployment status
- Check resource usage
- View application logs
- Monitor environment variables

### Health Checks
- `/ping` endpoint for basic health
- `/admin/stats` for admin system health
- Database connectivity checks

## 🎯 Next Steps

1. **Deploy to Railway:**
   - Push your changes to git
   - Railway will automatically deploy

2. **Run Database Migrations:**
   - Access Railway shell
   - Run migration commands

3. **Setup Admin System:**
   - Run admin setup script
   - Verify admin users are created

4. **Test All Endpoints:**
   - Use the test script
   - Verify admin panel functionality

5. **Update Frontend:**
   - Point frontend to Railway API
   - Test admin panel features

## 📞 Support

If you encounter issues:

1. Check Railway logs for errors
2. Verify environment variables
3. Test database connectivity
4. Run the test script
5. Check admin system setup

The admin system is now ready for Railway deployment! 🚀
