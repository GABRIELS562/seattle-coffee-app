#!/bin/bash

# Seattle Coffee App - Server Deployment Script
# This script deploys your app to your Linux server

echo "🚀 Seattle Coffee Server Deployment"
echo "===================================="

# Configuration
SERVER_USER="your-username"
SERVER_IP="your-server-ip"
SERVER_PATH="/opt/seattle-coffee"
APP_PORT="8080"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if configuration is set
if [ "$SERVER_USER" = "your-username" ] || [ "$SERVER_IP" = "your-server-ip" ]; then
    print_error "Please edit this script and set your SERVER_USER and SERVER_IP"
    exit 1
fi

# Menu for deployment options
echo ""
echo "Choose deployment option:"
echo "1) Simple deployment (HTTP only, no auth)"
echo "2) With password protection (HTTP + Basic Auth)"
echo "3) With HTTPS + password (Caddy auto-SSL)"
echo "4) Full setup with domain (HTTPS + Auth + Domain)"
echo ""
read -p "Enter choice [1-4]: " choice

# Build the application
print_status "Building application..."
npm run build

# Create deployment package
print_status "Creating deployment package..."
tar -czf seattle-coffee-deploy.tar.gz \
    build/ \
    Dockerfile \
    docker-compose.yml \
    nginx.conf \
    nginx-auth.conf \
    Caddyfile \
    package*.json

# Copy to server
print_status "Copying files to server..."
scp seattle-coffee-deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

# Deploy on server
print_status "Deploying on server..."

case $choice in
    1)
        # Simple HTTP deployment
        ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
        # Create app directory
        sudo mkdir -p /opt/seattle-coffee
        cd /opt/seattle-coffee
        
        # Extract files
        sudo tar -xzf /tmp/seattle-coffee-deploy.tar.gz
        
        # Build and run with Docker
        sudo docker build -t seattle-coffee .
        sudo docker stop seattle-coffee 2>/dev/null || true
        sudo docker rm seattle-coffee 2>/dev/null || true
        sudo docker run -d \
            --name seattle-coffee \
            -p 8080:80 \
            --restart unless-stopped \
            seattle-coffee
        
        echo "✅ Deployment complete!"
ENDSSH
        print_status "App deployed successfully!"
        echo ""
        echo "📱 Access your app at:"
        echo "   http://${SERVER_IP}:${APP_PORT}"
        ;;
        
    2)
        # HTTP with Basic Auth
        read -p "Enter username for authentication: " auth_user
        read -s -p "Enter password for authentication: " auth_pass
        echo ""
        
        # Generate htpasswd
        htpasswd_hash=$(docker run --rm httpd:alpine htpasswd -nb ${auth_user} ${auth_pass})
        echo "$htpasswd_hash" > .htpasswd
        
        # Copy htpasswd to server
        scp .htpasswd ${SERVER_USER}@${SERVER_IP}:/tmp/
        
        ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
        sudo mkdir -p /opt/seattle-coffee
        cd /opt/seattle-coffee
        
        sudo tar -xzf /tmp/seattle-coffee-deploy.tar.gz
        sudo mv /tmp/.htpasswd .
        
        # Use nginx-auth.conf instead
        sudo docker build -t seattle-coffee .
        sudo docker stop seattle-coffee 2>/dev/null || true
        sudo docker rm seattle-coffee 2>/dev/null || true
        sudo docker run -d \
            --name seattle-coffee \
            -p 8080:80 \
            -v $(pwd)/nginx-auth.conf:/etc/nginx/conf.d/default.conf \
            -v $(pwd)/.htpasswd:/etc/nginx/.htpasswd \
            --restart unless-stopped \
            seattle-coffee
        
        echo "✅ Deployment complete with authentication!"
ENDSSH
        print_status "App deployed with password protection!"
        echo ""
        echo "📱 Access your app at:"
        echo "   http://${SERVER_IP}:${APP_PORT}"
        echo "   Username: ${auth_user}"
        echo "   Password: ${auth_pass}"
        ;;
        
    3)
        # HTTPS with Caddy
        read -p "Enter your domain (or leave blank for IP): " domain
        read -p "Enter username for authentication: " auth_user
        read -s -p "Enter password for authentication: " auth_pass
        echo ""
        
        ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
        sudo mkdir -p /opt/seattle-coffee
        cd /opt/seattle-coffee
        
        sudo tar -xzf /tmp/seattle-coffee-deploy.tar.gz
        
        # Update Caddyfile with credentials
        sudo docker run --rm caddy:alpine caddy hash-password --plaintext '${auth_pass}' > /tmp/hash
        hash=\$(cat /tmp/hash)
        
        # Create custom Caddyfile
        if [ -z "$domain" ]; then
            # IP-based with self-signed cert
            cat > Caddyfile << EOF
:443 {
    tls internal
    basicauth {
        ${auth_user} \$hash
    }
    reverse_proxy seattle-coffee:80
}
EOF
        else
            # Domain-based with Let's Encrypt
            cat > Caddyfile << EOF
${domain} {
    basicauth {
        ${auth_user} \$hash
    }
    reverse_proxy seattle-coffee:80
}
EOF
        fi
        
        # Run with docker-compose
        sudo docker-compose up -d seattle-coffee caddy
        
        echo "✅ Deployment complete with HTTPS!"
ENDSSH
        
        print_status "App deployed with HTTPS!"
        echo ""
        echo "📱 Access your app at:"
        if [ -z "$domain" ]; then
            echo "   https://${SERVER_IP}"
        else
            echo "   https://${domain}"
        fi
        echo "   Username: ${auth_user}"
        echo "   Password: ${auth_pass}"
        ;;
        
    4)
        # Full setup
        read -p "Enter your domain: " domain
        read -p "Enter username for authentication: " auth_user
        read -s -p "Enter password for authentication: " auth_pass
        echo ""
        read -p "Enter your email for SSL certificate: " email
        
        ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
        sudo mkdir -p /opt/seattle-coffee
        cd /opt/seattle-coffee
        
        sudo tar -xzf /tmp/seattle-coffee-deploy.tar.gz
        
        # Setup with domain
        sudo docker-compose down 2>/dev/null || true
        
        # Update Caddyfile
        sudo docker run --rm caddy:alpine caddy hash-password --plaintext '${auth_pass}' > /tmp/hash
        hash=\$(cat /tmp/hash)
        
        cat > Caddyfile << EOF
${domain} {
    basicauth {
        ${auth_user} \$hash
    }
    reverse_proxy seattle-coffee:80
    
    tls ${email}
}
EOF
        
        # Run everything
        sudo docker-compose up -d
        
        echo "✅ Full deployment complete!"
ENDSSH
        
        print_status "App fully deployed with domain!"
        echo ""
        echo "📱 Access your app at:"
        echo "   https://${domain}"
        echo "   Username: ${auth_user}"
        echo "   Password: ${auth_pass}"
        ;;
esac

# Cleanup
rm -f seattle-coffee-deploy.tar.gz .htpasswd 2>/dev/null

echo ""
echo "===================================="
echo "🎉 Deployment Complete!"
echo ""
echo "📝 Server commands:"
echo "   Check status:  ssh ${SERVER_USER}@${SERVER_IP} 'docker ps'"
echo "   View logs:     ssh ${SERVER_USER}@${SERVER_IP} 'docker logs seattle-coffee'"
echo "   Restart:       ssh ${SERVER_USER}@${SERVER_IP} 'docker restart seattle-coffee'"
echo "   Stop:          ssh ${SERVER_USER}@${SERVER_IP} 'docker stop seattle-coffee'"
echo ""