# Dockerfile for NoodleSeed MCP Server (Hybrid: Standard SDK + React Widgets)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json tsconfig.json ./

# Install all dependencies
RUN npm ci

# Copy server source code
COPY src ./src

# Copy pre-built React widget HTML files
COPY dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=8000
ENV NODE_ENV=production

# Expose port
EXPOSE 8000

# Start the server with tsx
CMD ["npx", "tsx", "src/server.ts"]