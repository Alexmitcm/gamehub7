FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package files first
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files
COPY apps/api/package.json ./apps/api/
COPY packages/data/package.json ./packages/data/
COPY packages/helpers/package.json ./packages/helpers/
COPY packages/indexer/package.json ./packages/indexer/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN cd apps/api && npx prisma generate --schema=src/prisma/schema.prisma

# Build the API
RUN pnpm --filter @hey/api build

# Expose port
EXPOSE 8080

# Set working directory to API
WORKDIR /app/apps/api

# Start the application
CMD ["pnpm", "start"]
