# --- Step 1: Build the app ---
    FROM node:18-alpine AS builder

    WORKDIR /app
    
    # Copy dependency files and install early for better caching
    COPY package*.json ./
    RUN npm install
    
    # Copy source files
    COPY . .
    
    # Build the Next.js app
    RUN npm run build
    
    # --- Step 2: Run the app in production ---
    FROM node:18-alpine AS runner
    
    WORKDIR /app
    
    COPY --from=builder /app ./
    
    # If using static export (next export), you may need `npx serve` instead
    
    EXPOSE 3000
    ENV NODE_ENV=production
    
    CMD ["npm", "start"]
    