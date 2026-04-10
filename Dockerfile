# Use Bun for faster build and execution
FROM oven/bun:latest AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client
RUN bun prisma generate
# Build Next.js
RUN bun run build

# Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install system dependencies needed for bots
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    php-cli \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy build artifacts
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["bun", "server.js"]
