#!/bin/bash

# Seattle Coffee Private Server Launcher
# This script starts your app privately on your local network

echo "🚀 Starting Seattle Coffee App (Private Mode)"
echo "============================================"

# Build the app
echo "📦 Building app..."
npm run build

# Get local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
else
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

# Start server
echo ""
echo "✅ App is ready!"
echo "============================================"
echo "📱 Access from your devices:"
echo ""
echo "   Computer: http://localhost:3000"
echo "   Phone/Tablet: http://$LOCAL_IP:3000"
echo ""
echo "📲 To install on phone:"
echo "   1. Open the URL above in Safari/Chrome"
echo "   2. Tap Share → Add to Home Screen"
echo ""
echo "🔒 This is PRIVATE - only devices on your WiFi can access"
echo "============================================"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npx serve -s build -l 0.0.0.0 -p 3000