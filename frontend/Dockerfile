# --- Build stage ---
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source + config + env
COPY . .
# COPY .env.production ./.env.production
COPY next.config.ts ./next.config.ts

# Build Next.js app (env vars injected here)
RUN npm run build

# --- Run stage ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy only what's needed for runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
# COPY --from=builder /app/.env.production ./.env.production

# Remove devDependencies
RUN npm prune --production

EXPOSE 3000

# Start Next.js in production
CMD ["npx", "next", "start", "-p", "3000"]
