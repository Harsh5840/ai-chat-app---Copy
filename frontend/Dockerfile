# --- Build stage ---
    FROM node:22-alpine AS builder

    WORKDIR /app
    
    # Install deps
    COPY package*.json ./
    RUN npm install
    
    # Copy rest of source
    COPY . .
    
    # Build Next.js app
    RUN npm run build
    
    # --- Run stage ---
    FROM node:22-alpine AS runner
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV PORT=3000
    
    # Copy only what’s needed from builder
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/next.config.js ./next.config.js
    
    EXPOSE 3000
    
    CMD ["npm", "start"]
    