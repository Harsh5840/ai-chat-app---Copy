FROM node:18-alpine

WORKDIR /app

# Copy package files and prisma folder
COPY package*.json prisma ./
COPY .env .
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy rest of the app
COPY . .

EXPOSE 3001
CMD ["npm", "start"]
