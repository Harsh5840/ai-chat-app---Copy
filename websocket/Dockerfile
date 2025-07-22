# Use lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose WebSocket port
EXPOSE 7070

# Start the WebSocket server
CMD ["npm", "start"]
