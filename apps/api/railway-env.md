# Railway Environment Configuration

## Required Environment Variables for Railway Deployment

### Database Configuration
```bash
DATABASE_URL="postgresql://username:password@host:port/database"
```

### Railway Deployment URL
```bash
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

### WebSocket Configuration
```bash
WS_PORT="3011"
```

### Redis Configuration (optional)
```bash
REDIS_URL="redis://localhost:6379"
```

### JWT Configuration
```bash
JWT_SECRET="your-jwt-secret-key"
```

### AWS Configuration (for file uploads)
```bash
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-s3-bucket"
```

### Environment
```bash
NODE_ENV="production"
PORT="8080"
```

### Admin Configuration
```bash
ADMIN_WALLET_ADDRESSES="0x1234567890abcdef1234567890abcdef12345678,0x876543210fedcba9876543210fedcba9876543210"
```

## Railway Setup Steps

1. **Set Environment Variables in Railway Dashboard:**
   - Go to your Railway project dashboard
   - Navigate to the "Variables" tab
   - Add all the required environment variables above

2. **Database Migration:**
   ```bash
   # Run this in Railway's shell or via deployment
   npx prisma migrate deploy --schema=src/prisma/schema.prisma
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate --schema=src/prisma/schema.prisma
   ```

4. **Setup Admin System:**
   ```bash
   npx tsx scripts/setup-admin-simple.ts
   ```

## Testing the Deployment

1. **Health Check:**
   ```bash
   curl https://defigame-production.up.railway.app/ping
   ```

2. **Admin Endpoints:**
   ```bash
   curl https://defigame-production.up.railway.app/admin/stats
   ```

3. **Database Connection:**
   ```bash
   curl https://defigame-production.up.railway.app/admin/features
   ```
