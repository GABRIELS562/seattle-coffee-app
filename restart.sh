#!/bin/bash
echo "🔄 Restarting Seattle Coffee App..."

# Kill existing processes
pkill -f "react-scripts start" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 2

# Start fresh
echo "🚀 Starting development server..."
FAST_REFRESH=false npm start