#!/bin/bash
set -e

mkdir -p docs/screenshots

# Start preview server in background
npx vite preview --port 4173 > /dev/null 2>&1 &
SERVER_PID=$!

cleanup() {
  kill $SERVER_PID 2>/dev/null || true
}
trap cleanup EXIT

# Wait for server to start
sleep 2

CHROME_BIN=$(which chromium || which google-chrome)

for width in 360 768 1440; do
  height=900
  if [ "$width" = "360" ]; then height=800; fi
  if [ "$width" = "768" ]; then height=1024; fi

  for route in "" "download" "pricing" "contact" "auth"; do
    name="home"
    if [ -n "$route" ]; then name="$route"; fi
    
    url="http://localhost:4173/Landing-page/#/$route"
    output="docs/screenshots/${name}-${width}px.png"
    
    $CHROME_BIN --headless --no-sandbox --disable-gpu \
      --window-size=${width},${height} \
      --screenshot="$output" \
      "$url" 2>/dev/null || true
      
    echo "Captured $output"
  done
done

echo "All screenshots captured successfully."
