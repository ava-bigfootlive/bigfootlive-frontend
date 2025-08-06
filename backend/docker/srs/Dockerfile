# SRS (Simple Realtime Server) for BigFoot Live
FROM ossrs/srs:5

# Set working directory
WORKDIR /usr/local/srs

# Copy custom configuration template
COPY srs.conf /usr/local/srs/conf/srs.conf

# Create directories for HLS and recordings
RUN mkdir -p /usr/local/srs/objs/nginx/html/live \
    && mkdir -p /usr/local/srs/recordings \
    && mkdir -p /var/log/srs

# Set permissions
RUN chmod -R 755 /usr/local/srs/objs/nginx/html/live \
    && chmod -R 755 /usr/local/srs/recordings

# Expose ports
# 1935: RTMP ingestion
# 8080: HTTP API and admin
# 8081: HLS delivery  
# 1985: HTTP server
# 8000: Stream caster (optional)
EXPOSE 1935 8080 8081 1985 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/v1/summaries || exit 1

# Environment variables for configuration
ENV SRS_LOG_LEVEL=info
ENV SRS_HTTP_API_ENABLED=on
ENV SRS_HTTP_API_LISTEN=8080
ENV SRS_HTTP_SERVER_ENABLED=on  
ENV SRS_HTTP_SERVER_LISTEN=8081
ENV SRS_RTMP_LISTEN=1935

# Start SRS
CMD ["./objs/srs", "-c", "conf/srs.conf"]
