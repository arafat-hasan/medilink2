FROM node:20-alpine

# Set working directory
WORKDIR /app/backend

# Copy package files from backend directory
COPY backend/package.json backend/package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source code
COPY backend/ .

# Create database directory
RUN mkdir -p /app/backend/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Run migrations and start server
CMD ["sh", "-c", "npm run migrate && npm run seed && npm start"]
