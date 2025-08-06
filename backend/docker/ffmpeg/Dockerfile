# FFmpeg Processing Service for BigFoot Live
FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    jq \
    ffmpeg \
    ca-certificates \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18.x from NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Create working directories
WORKDIR /app
RUN mkdir -p /input /output /scripts /tmp/processing /app/logs

# Copy processing scripts
COPY scripts/ /scripts/
RUN chmod +x /scripts/*.sh

# Install Node.js dependencies for advanced processing
COPY package.json /app/
RUN npm install

# Copy the main processing application
COPY processor.js /app/

# Environment variables
ENV INPUT_DIR=/input
ENV OUTPUT_DIR=/output
ENV TEMP_DIR=/tmp/processing
ENV NODE_ENV=production

# Expose port for health checks
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the processing service
CMD ["node", "processor.js"]
