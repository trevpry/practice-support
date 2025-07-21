# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Set environment for PostgreSQL in production
ENV DATABASE_PROVIDER=postgresql
ENV NODE_ENV=production

# Setup database and generate Prisma client
WORKDIR /app/server
RUN npm run db:setup

# Expose port
EXPOSE 5001

# Start the application
WORKDIR /app
CMD ["npm", "start"]
