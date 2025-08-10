#!/bin/bash

# Supabase Deployment Script for 0Xgamehub
# This script sets up and deploys the Supabase project

set -e

echo "🚀 Starting Supabase deployment for 0Xgamehub..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    echo "   or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're in the project root
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Initialize Supabase project if not already initialized
if [ ! -d "supabase/.branches" ]; then
    echo "📁 Initializing Supabase project..."
    supabase init
fi

# Start local development environment
echo "🏠 Starting local Supabase development environment..."
supabase start

# Get local credentials
echo "🔑 Getting local credentials..."
supabase status

# Apply migrations
echo "🗄️ Applying database migrations..."
supabase db reset

# Generate types (optional - for development)
echo "📝 Generating TypeScript types..."
supabase gen types typescript --local > apps/web/src/lib/database.types.local.ts

# Create storage buckets
echo "📦 Setting up storage buckets..."
supabase storage ls

echo "✅ Supabase deployment completed successfully!"
echo ""
echo "🌐 Local URLs:"
echo "   - Supabase Studio: http://localhost:54323"
echo "   - API: http://localhost:54321"
echo "   - Database: postgresql://postgres:postgres@localhost:54322/postgres"
echo ""
echo "🔑 Default credentials:"
echo "   - Email: supabase_admin@admin.com"
echo "   - Password: this_password_is_insecure_and_should_be_updated"
echo ""
echo "📋 Next steps:"
echo "   1. Update your .env files with the local URLs"
echo "   2. Run 'supabase db push' to deploy to production"
echo "   3. Set up your production Supabase project"
echo ""
echo "🛑 To stop: supabase stop"
echo "🔄 To restart: supabase restart"
