# Use Node.js 20 Alpine for smaller image
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy only the API package files
COPY apps/api/package.json ./apps/api/
COPY apps/api/pnpm-lock.yaml ./apps/api/

# Copy workspace configuration
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./

# Install dependencies for API only
RUN cd apps/api && pnpm install --frozen-lockfile

# Copy API source code
COPY apps/api/src ./apps/api/src
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/env.d.ts ./apps/api/

# Generate Prisma client
RUN cd apps/api && pnpm codegen

# Expose port
EXPOSE 3000

# Start the API
CMD ["cd", "apps/api", "&&", "tsx", "src/index.ts"]
