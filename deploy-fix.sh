#!/bin/bash
echo "Starting fresh deployment..."

cd /opt/seattle-coffee/seattle-coffee-app

# Pull latest changes
echo "Pulling latest code..."
git pull origin main

# Clear any local node_modules or build artifacts
echo "Cleaning local artifacts..."
rm -rf node_modules
rm -rf build

# Force Docker to rebuild completely
echo "Removing old images..."
docker stop coffee-app || true
docker rm coffee-app || true
docker rmi seattle-coffee || true

# Build fresh image
echo "Building fresh Docker image..."
docker build -t seattle-coffee . --no-cache --pull

# Run new container
echo "Starting new container..."
docker run -d \
  --name coffee-app \
  -p 8080:80 \
  --restart unless-stopped \
  -v /opt/seattle-coffee/.htpasswd:/etc/nginx/.htpasswd:ro \
  seattle-coffee

# Clean up old Docker artifacts
echo "Cleaning Docker system..."
docker system prune -f

echo "Deployment complete! Please clear browser cache."