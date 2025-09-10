FROM node:22-alpine

WORKDIR /app

# needed for bcrypt, Prisma, etc.
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --production

COPY . .

# Prisma needs to generate the client inside container
RUN npx prisma generate

EXPOSE 3001


CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]    