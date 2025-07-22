# --- Step 1: Build the app ---
    FROM node:18-alpine AS builder

    WORKDIR /app
    COPY . .
    
    RUN npm install
    RUN npm run build
    
    # --- Step 2: Run the app in production ---
    FROM node:18-alpine AS runner
    
    WORKDIR /app
    COPY --from=builder /app ./
    
    EXPOSE 3000
    ENV NODE_ENV=production
    
    CMD ["npm", "start"]
    