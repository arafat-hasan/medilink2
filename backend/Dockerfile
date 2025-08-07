FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY --chown=node:node package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY --chown=node:node . .

# Create database directory and set permissions
RUN mkdir -p /app/data && \
    chown -R node:node /app/data && \
    chmod 755 /app/data

# Switch to non-root user
USER node

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Run migrations and start server
CMD ["sh", "-c", "npm run migrate && npm run seed && npm start"]
