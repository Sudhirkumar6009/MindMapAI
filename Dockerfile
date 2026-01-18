# Root Dockerfile for Google Cloud Build
# This builds the backend service by default
# 
# To build backend: docker build -t mindmapai-backend .
# To build frontend: docker build -t mindmapai-frontend -f frontend/Dockerfile frontend/

FROM node:20-alpine

# Add wget for healthcheck
RUN apk add --no-cache wget

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy backend source code
COPY backend/ .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the server
CMD ["node", "src/server.js"]
