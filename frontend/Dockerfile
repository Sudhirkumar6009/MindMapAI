# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json only (not package-lock.json to avoid platform mismatch)
COPY package.json ./

# Install dependencies fresh for Linux
RUN npm install

# Copy source code (exclude package-lock.json via .dockerignore)
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:5000
ARG VITE_API_BASE=/api
ARG VITE_NODE_ENV=production

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_NODE_ENV=$VITE_NODE_ENV

# Build the application
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]