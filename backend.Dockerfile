FROM node:20-alpine

WORKDIR /app

# Install dependencies needed by SQLite
RUN apk add --no-cache python3 make g++ 

COPY package*.json ./
RUN npm install --production

# Rebuild sqlite3 natively for Alpine
RUN npm rebuild sqlite3 --build-from-source

COPY backend/ ./backend

# Make data directory persistent
RUN mkdir -p /app/backend/data && chmod 777 /app/backend/data

EXPOSE 3000

# Start server natively
CMD ["node", "backend/server.js"]
