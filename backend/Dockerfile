# Multi-stage Docker build for Node.js backend with SRS integration

# Stage 1: Base SRS build
FROM ossrs/srs:5 as srs-base

# Stage 2: Node.js application build
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Stage 3: Production image
FROM node:18-alpine

# Install required system packages
RUN apk add --no-cache \
    ffmpeg \
    curl \
    bash \
    ca-certificates

# Create app directory
WORKDIR /app

# Copy SRS binaries from base image
COPY --from=srs-base /usr/local/srs/objs/srs /usr/local/bin/srs
COPY --from=srs-base /usr/local/srs/objs/ffmpeg/bin/ffmpeg /usr/local/bin/ffmpeg

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bigfoot -u 1001

# Copy built application from build stage
COPY --from=build --chown=bigfoot:nodejs /app/dist ./dist
COPY --from=build --chown=bigfoot:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=bigfoot:nodejs /app/package*.json ./

# Create directories for SRS
RUN mkdir -p /app/srs-configs /app/srs-data /app/logs && \
    chown -R bigfoot:nodejs /app

# Switch to non-root user
USER bigfoot

# Expose ports
EXPOSE 3000 1935 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "dist/server.js"]
