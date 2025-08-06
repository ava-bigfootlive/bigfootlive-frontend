#!/bin/bash

# HLS Conversion Script for BigFoot Live
# Usage: convert_to_hls.sh <input_file> <output_dir> [stream_id]

set -e

INPUT_FILE="$1"
OUTPUT_DIR="$2"
STREAM_ID="${3:-stream}"

if [[ -z "$INPUT_FILE" || -z "$OUTPUT_DIR" ]]; then
    echo "Usage: $0 <input_file> <output_dir> [stream_id]"
    exit 1
fi

if [[ ! -f "$INPUT_FILE" ]]; then
    echo "Error: Input file '$INPUT_FILE' does not exist"
    exit 1
fi

# Create output directory structure
mkdir -p "$OUTPUT_DIR"/{1080p,720p,480p,360p,thumbnails}

echo "Starting HLS conversion for: $INPUT_FILE"
echo "Output directory: $OUTPUT_DIR"

# HLS segment duration and playlist settings
HLS_TIME=6
HLS_LIST_SIZE=0

# Quality presets
declare -A QUALITIES=(
    ["1080p"]="1920:1080:5000k"
    ["720p"]="1280:720:2500k"
    ["480p"]="854:480:1000k"
    ["360p"]="640:360:500k"
)

# Function to convert to specific quality
convert_quality() {
    local quality=$1
    local params=${QUALITIES[$quality]}
    local width=$(echo $params | cut -d: -f1)
    local height=$(echo $params | cut -d: -f2)
    local bitrate=$(echo $params | cut -d: -f3)
    
    local output_dir="$OUTPUT_DIR/$quality"
    
    echo "Converting to $quality ($width x $height @ $bitrate)..."
    
    ffmpeg -i "$INPUT_FILE" \
        -c:v libx264 \
        -preset medium \
        -crf 23 \
        -c:a aac \
        -b:a 128k \
        -vf "scale=$width:$height" \
        -b:v "$bitrate" \
        -maxrate "$bitrate" \
        -bufsize "$(echo $bitrate | sed 's/k/*2k/')" \
        -hls_time $HLS_TIME \
        -hls_list_size $HLS_LIST_SIZE \
        -hls_segment_filename "$output_dir/segment_%03d.ts" \
        -hls_flags delete_segments \
        "$output_dir/playlist.m3u8" \
        -y
    
    echo "✓ $quality conversion completed"
}

# Convert all qualities in parallel
for quality in "${!QUALITIES[@]}"; do
    convert_quality "$quality" &
done

# Generate thumbnails
echo "Generating thumbnails..."
ffmpeg -i "$INPUT_FILE" \
    -vf "fps=1/10,scale=320:180" \
    -q:v 2 \
    "$OUTPUT_DIR/thumbnails/thumb_%03d.jpg" \
    -y &

# Wait for all background jobs to complete
wait

# Generate master playlist
echo "Generating master playlist..."
cat > "$OUTPUT_DIR/master.m3u8" << EOF
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720
720p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=854x480
480p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=500000,RESOLUTION=640x360
360p/playlist.m3u8
EOF

# Generate metadata
echo "Generating metadata..."
ffprobe -v quiet -print_format json -show_format -show_streams "$INPUT_FILE" > "$OUTPUT_DIR/metadata.json"

# Create processing info file
cat > "$OUTPUT_DIR/processing_info.json" << EOF
{
    "streamId": "$STREAM_ID",
    "inputFile": "$INPUT_FILE",
    "outputDir": "$OUTPUT_DIR",
    "processedAt": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")",
    "qualities": ["1080p", "720p", "480p", "360p"],
    "hlsSettings": {
        "segmentDuration": $HLS_TIME,
        "playlistSize": $HLS_LIST_SIZE
    }
}
EOF

echo "✅ HLS conversion completed successfully!"
echo "Master playlist: $OUTPUT_DIR/master.m3u8"
echo "Qualities available: 1080p, 720p, 480p, 360p"
echo "Thumbnails: $OUTPUT_DIR/thumbnails/"
