#!/bin/bash

# Stream Recording Script for BigFoot Live
# Usage: record_stream.sh <rtmp_url> <output_file> <duration> [format]

set -e

RTMP_URL="$1"
OUTPUT_FILE="$2"
DURATION="$3"
FORMAT="${4:-mp4}"

if [[ -z "$RTMP_URL" || -z "$OUTPUT_FILE" || -z "$DURATION" ]]; then
    echo "Usage: $0 <rtmp_url> <output_file> <duration> [format]"
    echo "Example: $0 rtmp://localhost:1935/live/stream123 /output/recording.mp4 3600"
    exit 1
fi

echo "Starting stream recording..."
echo "RTMP URL: $RTMP_URL"
echo "Output: $OUTPUT_FILE"
echo "Duration: $DURATION seconds"
echo "Format: $FORMAT"

# Create output directory if it doesn't exist
mkdir -p "$(dirname "$OUTPUT_FILE")"

# Record the stream
ffmpeg -i "$RTMP_URL" \
    -c:v libx264 \
    -preset ultrafast \
    -crf 23 \
    -c:a aac \
    -b:a 128k \
    -t "$DURATION" \
    -f "$FORMAT" \
    "$OUTPUT_FILE" \
    -y

echo "✅ Recording completed: $OUTPUT_FILE"

# Generate basic metadata
if command -v ffprobe >/dev/null 2>&1; then
    echo "Generating metadata..."
    ffprobe -v quiet -print_format json -show_format -show_streams "$OUTPUT_FILE" > "${OUTPUT_FILE%.*}_metadata.json"
fi
