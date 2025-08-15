#!/bin/sh

echo "Starting application..."

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=src/prisma/schema.prisma

# Start the application
echo "Starting the application..."
pnpm start
