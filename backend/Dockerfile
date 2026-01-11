FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port (Cloud Run will set PORT env variable)
EXPOSE 8080

# Start the server
CMD ["node", "src/server.js"]
