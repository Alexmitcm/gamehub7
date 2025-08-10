# Supabase Deployment Guide for 0Xgamehub

This guide will walk you through setting up Supabase as your deployment environment for the 0Xgamehub project.

## 🚀 Quick Start

### 1. Install Supabase CLI

```bash
# Using npm
npm install -g supabase

# Using Homebrew (macOS)
brew install supabase/tap/supabase

# Using Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Initialize Project

```bash
# From project root
supabase init
```

## 🏗️ Local Development Setup

### 1. Start Local Environment

```bash
# Start all services
supabase start

# Check status
supabase status
```

### 2. Apply Migrations

```bash
# Reset database (local only)
supabase db reset

# Apply specific migration
supabase db push
```

### 3. Generate Types

```bash
# Generate TypeScript types from local schema
supabase gen types typescript --local > apps/web/src/lib/database.types.local.ts

# Generate types from remote schema
supabase gen types typescript --project-id YOUR_PROJECT_ID > apps/web/src/lib/database.types.ts
```

## 🌐 Production Deployment

### 1. Create Production Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `0xgamehub-prod`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Select appropriate plan

### 2. Link Local to Remote

```bash
# Link to your production project
supabase link --project-ref YOUR_PROJECT_ID

# Verify link
supabase projects list
```

### 3. Deploy Schema

```bash
# Push local schema to production
supabase db push

# Or run specific migration
supabase db push --include-all
```

### 4. Set Up Storage Buckets

```bash
# Create storage buckets
supabase storage ls

# Set bucket policies (if needed)
supabase storage policy list
```

## 🔧 Environment Configuration

### Web App (.env)

```bash
# Copy template
cp apps/web/env.example apps/web/.env

# Update with your values
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### API (.env)

```bash
# Copy template
cp apps/api/env.example apps/api/.env

# Update with your values
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

## 🗄️ Database Schema

The project includes a comprehensive schema with:

- **Profiles**: User profiles with gaming stats
- **Games**: Game sessions and results
- **Transactions**: Financial transactions
- **Premium Subscriptions**: User subscription management
- **Referral Rewards**: Referral system tracking
- **Game Statistics**: Detailed gaming analytics

### Key Features

- Row Level Security (RLS) policies
- Automatic user profile creation
- Game statistics tracking
- Referral system support
- Premium feature management

## 🔐 Security & Authentication

### 1. Row Level Security

All tables have RLS enabled with appropriate policies:

- Users can only access their own data
- Game participants can view shared games
- Referral rewards are visible to both parties

### 2. Authentication Providers

Configure these in Supabase Dashboard:

- **Email/Password**: Default enabled
- **OAuth Providers**: Google, GitHub, Discord
- **Phone**: SMS verification (requires provider setup)

### 3. JWT Configuration

```toml
[auth]
jwt_expiry = 3600
enable_refresh_token_rotation = true
refresh_token_reuse_interval = 10
```

## 📊 Storage Configuration

### 1. Default Buckets

- **avatars**: User profile pictures
- **game-assets**: Game-related files
- **documents**: User documents

### 2. Storage Policies

```sql
-- Example: Users can upload their own avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 🔄 CI/CD Integration

### 1. GitHub Actions

The project includes GitHub Actions workflows that can be extended for Supabase:

```yaml
# Add to .github/workflows/ci-cd.yml
- name: Deploy to Supabase
  run: |
    supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
    supabase db push
```

### 2. Environment Variables

Add these secrets to your GitHub repository:

- `SUPABASE_PROJECT_ID`: Your Supabase project ID
- `SUPABASE_ACCESS_TOKEN`: Your Supabase access token

## 📱 Client Integration

### 1. Web App

The web app is already configured with:

- Supabase client setup
- Authentication helpers
- Database operation helpers
- Storage helpers
- Realtime subscriptions

### 2. API Integration

The API includes:

- Supabase client for database operations
- User authentication integration
- Game data management
- Transaction processing

## 🧪 Testing

### 1. Local Testing

```bash
# Start local environment
supabase start

# Run tests
pnpm test

# Stop environment
supabase stop
```

### 2. Test Data

```bash
# Seed test data
supabase db seed

# Reset to clean state
supabase db reset
```

## 📈 Monitoring & Analytics

### 1. Supabase Dashboard

Monitor your project through:

- **Database**: Query performance, connections
- **Auth**: User signups, logins
- **Storage**: File uploads, bandwidth
- **Edge Functions**: Execution metrics

### 2. Logs

```bash
# View logs
supabase logs

# Filter by service
supabase logs --service auth
supabase logs --service db
```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify environment variables
   - Check project status
   - Ensure proper linking

2. **Migration Failures**
   - Check schema conflicts
   - Verify database permissions
   - Review migration files

3. **Authentication Issues**
   - Verify OAuth provider setup
   - Check redirect URLs
   - Review JWT configuration

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Discord Community](https://discord.supabase.com)

## 🔄 Updates & Maintenance

### 1. Schema Updates

```bash
# Create new migration
supabase migration new migration_name

# Apply to local
supabase db reset

# Deploy to production
supabase db push
```

### 2. Supabase Updates

```bash
# Update CLI
npm update -g supabase

# Update local services
supabase stop
supabase start
```

## 📋 Checklist

- [ ] Install Supabase CLI
- [ ] Create production project
- [ ] Link local to remote
- [ ] Deploy database schema
- [ ] Configure environment variables
- [ ] Set up storage buckets
- [ ] Test authentication
- [ ] Verify RLS policies
- [ ] Set up CI/CD integration
- [ ] Configure monitoring
- [ ] Test all features
- [ ] Document customizations

## 🎯 Next Steps

After completing the setup:

1. **Customize Schema**: Add project-specific tables/fields
2. **Set Up Backups**: Configure automated backups
3. **Performance Tuning**: Optimize queries and indexes
4. **Security Review**: Audit RLS policies and permissions
5. **Monitoring**: Set up alerts and dashboards

---

**Need Help?** Check the troubleshooting section or reach out to the Supabase community!
