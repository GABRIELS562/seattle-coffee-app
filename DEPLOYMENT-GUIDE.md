# Seattle Coffee App - Complete Deployment Guide

## Table of Contents
1. [Quick Start - Home Server Deployment](#quick-start---home-server-deployment)
2. [Prerequisites](#prerequisites)
3. [Step 1: Prepare Your Home Server](#step-1-prepare-your-home-server)
4. [Step 2: Deploy Application with Docker](#step-2-deploy-application-with-docker)
5. [Step 3: Setup Cloudflare (Recommended)](#step-3-setup-cloudflare-recommended)
6. [Step 4: Configure Cloudflare Tunnel](#step-4-configure-cloudflare-tunnel)
7. [Step 5: Add User Authentication](#step-5-add-user-authentication)
8. [Alternative Deployment Options](#alternative-deployment-options)
9. [Mobile App Deployment](#mobile-app-deployment)
10. [Troubleshooting](#troubleshooting)
11. [Security Best Practices](#security-best-practices)
12. [Maintenance & Updates](#maintenance--updates)

---

## Quick Start - Home Server Deployment

**Time Required:** 30-45 minutes  
**Cost:** FREE (except domain name ~$10/year)  
**Result:** Secure web app accessible from anywhere at `https://coffee.yourdomain.com`

### What You'll Get:
- ✅ Web app accessible from anywhere (not just local network)
- ✅ Automatic HTTPS/SSL encryption
- ✅ Hidden home IP address
- ✅ DDoS protection from Cloudflare
- ✅ Support for 10+ users with authentication
- ✅ Mobile-friendly Progressive Web App

---

## Prerequisites

### Required:
- **Linux Server** (Ubuntu/Debian recommended) or any computer running Linux
- **Domain Name** (e.g., jagdevops.co.za) - $10-15/year from Namecheap, GoDaddy, etc.
- **Internet Connection** with stable home network
- **Basic Terminal Knowledge**

### Software to Install:
```bash
# Check if you have these (not required to pre-install):
docker --version      # Docker 20.10+ 
git --version        # Git 2.0+
```

---

## Step 1: Prepare Your Home Server

### 1.1 SSH into Your Server
```bash
# From your local machine (Mac/Windows/Linux)
ssh username@192.168.1.100  # Replace with your server's local IP

# Explanation: SSH provides secure remote access to your server
# Find your server's IP with: ip addr show | grep inet
```

### 1.2 Update System & Install Docker
```bash
# Update package lists
sudo apt update && sudo apt upgrade -y
# Explanation: Ensures you have latest security patches and software versions

# Install Docker using official script
curl -fsSL https://get.docker.com -o get-docker.sh
# Explanation: Downloads Docker's official installation script

sudo sh get-docker.sh
# Explanation: Runs the script to install Docker Engine

# Add your user to docker group (allows running docker without sudo)
sudo usermod -aG docker $USER
# Explanation: Adds your user to docker group for permission to run containers

# Log out and back in for group changes to take effect
exit
ssh username@192.168.1.100  # Log back in

# Verify Docker installation
docker --version
# Expected output: Docker version 24.0.x, build xxxxxxx
```

### 1.3 Create Application Directory
```bash
# Create directory for the app
sudo mkdir -p /opt/seattle-coffee
# Explanation: Creates directory structure; /opt is standard for optional software

# Set ownership to your user
sudo chown -R $USER:$USER /opt/seattle-coffee
# Explanation: Gives you full control of the directory

# Navigate to directory
cd /opt/seattle-coffee
# Explanation: Changes current directory to app location
```

---

## Step 2: Deploy Application with Docker

### 2.1 Get Application Files
```bash
# Option A: Clone from Git (if you have a repository)
git clone https://github.com/yourusername/seattle-coffee-app.git .
# Explanation: Downloads all app files from your Git repository

# Option B: Upload from local machine (if files are on your computer)
# From your local machine:
scp -r /path/to/seattle-coffee-app/* username@192.168.1.100:/opt/seattle-coffee/
# Explanation: Securely copies files from your computer to the server
```

### 2.2 Build Docker Image
```bash
# Ensure you're in the app directory
cd /opt/seattle-coffee

# Build the Docker image
docker build -t seattle-coffee .
# Explanation: 
# - docker build: Creates a container image
# - -t seattle-coffee: Tags (names) the image as "seattle-coffee"
# - . : Uses Dockerfile in current directory
# This process may take 2-5 minutes as it downloads dependencies

# Verify image was created
docker images | grep seattle-coffee
# Expected output: seattle-coffee    latest    xxxxxxxxx    2 minutes ago    150MB
```

### 2.3 Run Docker Container
```bash
# Run the container with automatic restart
docker run -d \
  --name coffee-app \
  -p 8080:80 \
  --restart unless-stopped \
  seattle-coffee

# Explanation of each flag:
# -d: Run in detached mode (background)
# --name coffee-app: Give container a friendly name
# -p 8080:80: Map port 8080 on host to port 80 in container
# --restart unless-stopped: Auto-restart on crash or reboot
# seattle-coffee: The image to run

# Verify container is running
docker ps
# Expected output: Shows coffee-app container with STATUS "Up X seconds"

# Test locally
curl http://localhost:8080
# Expected output: HTML content of your app (lots of text)
```

### 2.4 Test Local Access
```bash
# Get your server's local IP
ip addr show | grep "inet " | grep -v 127.0.0.1
# Example output: inet 192.168.1.100/24

# From another device on same network, open browser:
# http://192.168.1.100:8080
# You should see the Seattle Coffee app!
```

---

## Step 3: Setup Cloudflare (Recommended)

### Why Cloudflare?
- **FREE** for unlimited bandwidth
- **Hides your home IP** address
- **No port forwarding** needed (keeps router secure)
- **Automatic SSL** certificates
- **DDoS protection** included
- **User authentication** (free for up to 50 users)

### 3.1 Create Cloudflare Account
```bash
# Open browser and navigate to:
https://dash.cloudflare.com/sign-up

# Steps:
# 1. Enter email and password
# 2. Verify email address
# 3. You now have a Cloudflare account!
```

### 3.2 Add Your Domain
```bash
# In Cloudflare Dashboard:
# 1. Click "Add a Site" button
# 2. Enter your domain: jagdevops.co.za
# 3. Select FREE plan ($0/month)
# 4. Click Continue

# Cloudflare will scan existing DNS records (takes 1 minute)
# Review and confirm the records
```

### 3.3 Update Nameservers at Domain Registrar
```bash
# Cloudflare will show 2 nameservers like:
# - nama.ns.cloudflare.com
# - john.ns.cloudflare.com

# Steps for common registrars:
# GoDaddy:
#   1. Login to GoDaddy
#   2. My Products → DNS → Manage Zones
#   3. Change Nameservers → Enter Cloudflare's nameservers
#
# Namecheap:
#   1. Login to Namecheap
#   2. Domain List → Manage → Nameservers
#   3. Select "Custom DNS" → Enter Cloudflare's nameservers

# Verification (after 5-60 minutes):
# Cloudflare Dashboard will show: "Great news! Your domain is now active"
```

---

## Step 4: Configure Cloudflare Tunnel

### 4.1 Install Cloudflared on Server
```bash
# SSH into your server
ssh username@192.168.1.100
cd /opt/seattle-coffee

# Download and install cloudflared (Ubuntu/Debian)
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
# Explanation: Downloads the cloudflared tunnel client

sudo dpkg -i cloudflared-linux-amd64.deb
# Explanation: Installs the .deb package

# For other Linux distributions:
# wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
# chmod +x cloudflared-linux-amd64
# sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared

# Verify installation
cloudflared --version
# Expected output: cloudflared version 2024.x.x (built YYYY-MM-DD)
```

### 4.2 Authenticate with Cloudflare
```bash
# Login to Cloudflare (this opens a browser URL)
cloudflared tunnel login

# Output will show:
# "Please open the following URL and log in with your Cloudflare account:"
# https://dash.cloudflare.com/argotunnel?callback=...

# Steps:
# 1. Copy the URL and open in your browser
# 2. Select your domain (jagdevops.co.za)
# 3. Click "Authorize"

# Success message:
# "You have successfully logged in."
# Certificate saved to: /home/username/.cloudflared/cert.pem
```

### 4.3 Create the Tunnel
```bash
# Create a tunnel named "coffee-app"
cloudflared tunnel create coffee-app

# Output:
# Tunnel credentials written to /home/username/.cloudflared/TUNNEL-ID.json
# Created tunnel coffee-app with id: f1234567-89ab-cdef-0123-456789abcdef

# IMPORTANT: Save your Tunnel ID (you'll need it next)
# Example: f1234567-89ab-cdef-0123-456789abcdef
```

### 4.4 Configure the Tunnel
```bash
# Create configuration file
nano ~/.cloudflared/config.yml

# Add this content (replace placeholders):
```
```yaml
# Your tunnel ID from previous step
tunnel: f1234567-89ab-cdef-0123-456789abcdef

# Path to credentials file (replace username)
credentials-file: /home/username/.cloudflared/f1234567-89ab-cdef-0123-456789abcdef.json

# Ingress rules - how traffic is routed
ingress:
  # Main rule: Route coffee.jagdevops.co.za to your Docker container
  - hostname: coffee.jagdevops.co.za
    service: http://localhost:8080
    originRequest:
      # Optional settings for optimization
      noTLSVerify: false
      connectTimeout: 30s
      keepAliveTimeout: 30s
  
  # Catch-all rule (required) - returns 404 for unmatched requests
  - service: http_status:404
```
```bash
# Save and exit: Ctrl+X, then Y, then Enter
```

### 4.5 Route DNS to Tunnel
```bash
# Create DNS record pointing to your tunnel
cloudflared tunnel route dns coffee-app coffee.jagdevops.co.za

# Output:
# 2024-XX-XX INF Added CNAME coffee.jagdevops.co.za which will route to this tunnel

# This creates: coffee.jagdevops.co.za → TUNNEL-ID.cfargotunnel.com
```

### 4.6 Run the Tunnel
```bash
# Test run in foreground (see live logs)
cloudflared tunnel run coffee-app

# You should see:
# INF Starting tunnel
# INF Connection registered
# INF Tunnel is ready

# Test in browser: https://coffee.jagdevops.co.za
# If working, press Ctrl+C to stop test
```

### 4.7 Install as System Service
```bash
# Install as systemd service for auto-start
sudo cloudflared service install

# Start the service
sudo systemctl start cloudflared
# Explanation: Starts the tunnel service

# Enable auto-start on boot
sudo systemctl enable cloudflared
# Explanation: Ensures tunnel starts when server reboots

# Check status
sudo systemctl status cloudflared
# Expected: "Active: active (running)"

# View logs if needed
sudo journalctl -u cloudflared -f
# Press Ctrl+C to exit logs
```

### 4.8 Final Test
```bash
# From any device with internet:
# Open browser to: https://coffee.jagdevops.co.za
# ✅ You should see your Seattle Coffee app with HTTPS!
```

---

## Step 5: Add User Authentication

### For 10 Users (All FREE Options)

### Option A: Cloudflare Access (Recommended)
**FREE for up to 50 users - Most Professional**

```bash
# In Cloudflare Dashboard:
# 1. Go to Zero Trust (left sidebar)
# 2. Access → Applications
# 3. Click "Add an application"
# 4. Choose "Self-hosted"
```

**Configure Application:**
```yaml
Application name: Seattle Coffee App
Session Duration: 24 hours
Subdomain: coffee
Domain: jagdevops.co.za
```

**Configure Authentication Policy:**
```yaml
Policy name: Authorized Users
Action: Allow

# Choose authentication method:

# Option 1: Email List (Simplest)
Include → Emails:
  - user1@gmail.com
  - user2@yahoo.com
  - user3@outlook.com
  # Add up to 50 individual emails

# Option 2: Email Domain (For company)
Include → Email ending in:
  - @yourcompany.com

# Option 3: One-time PIN via Email
Include → Email OTP
# Users receive login code via email
```

**Save and Deploy**
- Click "Save application"
- Users now must authenticate before accessing app
- They'll see Cloudflare login page first

### Option B: Basic Authentication (Simpler)
**Password protection without Cloudflare Access**

```bash
# On your server:
# Install Apache utilities for password management
sudo apt-get install apache2-utils -y

# Create password file
htpasswd -c /opt/seattle-coffee/.htpasswd user1
# Enter password when prompted

# Add more users (without -c flag)
htpasswd /opt/seattle-coffee/.htpasswd user2
htpasswd /opt/seattle-coffee/.htpasswd user3
# Repeat for all 10 users

# Create nginx config with auth
nano /opt/seattle-coffee/nginx-auth.conf
```

Add this nginx configuration:
```nginx
server {
    listen 80;
    server_name localhost;
    
    # Password protection
    auth_basic "Seattle Coffee App";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Restart container with authentication
docker stop coffee-app
docker rm coffee-app

docker run -d \
  --name coffee-app \
  -p 8080:80 \
  --restart unless-stopped \
  -v /opt/seattle-coffee/.htpasswd:/etc/nginx/.htpasswd:ro \
  -v /opt/seattle-coffee/nginx-auth.conf:/etc/nginx/conf.d/default.conf:ro \
  seattle-coffee

# Users will see browser login prompt
```

---

## Alternative Deployment Options

### Option 1: Direct Port Forwarding (Less Secure)
```bash
# Router configuration:
# 1. Access router admin (usually 192.168.1.1)
# 2. Find Port Forwarding section
# 3. Forward external port 443 to SERVER-IP:8080
# 4. Access via: https://your-public-ip

# Get public IP:
curl ifconfig.me
```

### Option 2: Tailscale VPN (Very Secure, Private)
```bash
# Install Tailscale on server
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Install Tailscale on devices
# Access via Tailscale IP (100.x.x.x)
# No public exposure!
```

### Option 3: Dynamic DNS (For changing IPs)
```bash
# Use DuckDNS (free)
# 1. Sign up at duckdns.org
# 2. Create subdomain: coffee-app.duckdns.org
# 3. Install updater on server:

# Create update script
echo "curl 'https://www.duckdns.org/update?domains=coffee-app&token=YOUR-TOKEN&ip='" > ~/duckdns.sh
chmod +x ~/duckdns.sh

# Add to crontab for auto-update
crontab -e
# Add: */5 * * * * ~/duckdns.sh
```

---

## Mobile App Deployment

### Progressive Web App (Easiest)
Once deployed with Cloudflare:
1. Open `https://coffee.jagdevops.co.za` on phone
2. **iPhone:** Safari → Share → Add to Home Screen
3. **Android:** Chrome → Menu (⋮) → Add to Home Screen
4. App icon appears on home screen!

### Native Android App
```bash
# On development machine with Android Studio:
npm run build
npx cap sync android
npx cap open android

# In Android Studio:
# 1. Build → Build Bundle(s) / APK(s) → Build APK(s)
# 2. Transfer APK to phone
# 3. Install (enable "Unknown Sources" in settings)
```

### Native iOS App
```bash
# On Mac with Xcode:
npm run build
npx cap sync ios
npx cap open ios

# In Xcode:
# 1. Connect iPhone via USB
# 2. Select your device
# 3. Click Run (▶️)
```

---

## Troubleshooting

### Cannot Access App Externally
```bash
# 1. Check Docker container
docker ps
# Should show coffee-app as "Up"

# 2. Test local access
curl http://localhost:8080
# Should return HTML

# 3. Check tunnel status
sudo systemctl status cloudflared
# Should show "active (running)"

# 4. Check DNS propagation
nslookup coffee.jagdevops.co.za
# Should return Cloudflare IPs
```

### 502 Bad Gateway Error
```bash
# Container not running
docker start coffee-app

# Wrong port in config
# Check config.yml has correct port (8080)
nano ~/.cloudflared/config.yml

# Restart tunnel
sudo systemctl restart cloudflared
```

### SSL Certificate Errors
```bash
# Cloudflare handles SSL automatically
# Ensure Cloudflare DNS is active
# Check SSL/TLS setting in Cloudflare: Full or Flexible
```

### Container Crashes
```bash
# View logs
docker logs coffee-app --tail 50

# Rebuild if needed
docker stop coffee-app
docker rm coffee-app
docker build -t seattle-coffee . --no-cache
docker run -d --name coffee-app -p 8080:80 --restart unless-stopped seattle-coffee
```

### DNS Not Working
```bash
# Wait for propagation (5-60 minutes)
# Flush DNS cache:
# Windows: ipconfig /flushdns
# Mac: sudo dscacheutil -flushcache
# Linux: sudo systemd-resolve --flush-caches
```

---

## Security Best Practices

### 1. Keep Everything Updated
```bash
# Weekly: Update system
sudo apt update && sudo apt upgrade -y

# Monthly: Update Docker images
docker pull node:18-alpine
docker pull nginx:alpine
docker build -t seattle-coffee . --no-cache
docker restart coffee-app

# Quarterly: Update cloudflared
sudo apt update && sudo apt install --only-upgrade cloudflared
```

### 2. Monitor Access
```bash
# View tunnel analytics in Cloudflare Dashboard
# Zero Trust → Analytics

# Monitor Docker logs
docker logs coffee-app -f --tail 100

# Check tunnel logs
sudo journalctl -u cloudflared -f
```

### 3. Implement Rate Limiting
In Cloudflare Dashboard:
1. Security → WAF → Rate limiting rules
2. Create rule: 100 requests/minute per IP
3. Action: Challenge

### 4. Enable Cloudflare Security
In Cloudflare Dashboard:
- Security → Settings:
  - Bot Fight Mode: ON
  - Security Level: Medium
  - Challenge Passage: 30 minutes
  - Browser Integrity Check: ON

### 5. Regular Backups
```bash
# Create backup script
cat > /opt/backup-coffee.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d-%H%M%S)
mkdir -p $BACKUP_DIR

# Backup Docker container
docker commit coffee-app coffee-backup:$DATE
docker save coffee-backup:$DATE | gzip > $BACKUP_DIR/coffee-$DATE.tar.gz

# Keep only last 7 backups
find $BACKUP_DIR -name "coffee-*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/coffee-$DATE.tar.gz"
EOF

chmod +x /opt/backup-coffee.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /opt/backup-coffee.sh
```

---

## Maintenance & Updates

### Update Application Code
```bash
# If using Git
cd /opt/seattle-coffee
git pull origin main

# Rebuild and restart
docker build -t seattle-coffee .
docker restart coffee-app
```

### Monitor Resources
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Monitor container resources
docker stats coffee-app

# System overview
htop
```

### View Logs
```bash
# Application logs
docker logs coffee-app -f --tail 100

# Tunnel logs
sudo journalctl -u cloudflared -f

# System logs
sudo journalctl -xe
```

### Restart Services
```bash
# Restart Docker container
docker restart coffee-app

# Restart tunnel
sudo systemctl restart cloudflared

# Restart Docker daemon
sudo systemctl restart docker
```

---

## Quick Command Reference

```bash
# Docker Commands
docker ps                    # List running containers
docker logs coffee-app       # View app logs
docker restart coffee-app    # Restart app
docker stop coffee-app       # Stop app
docker start coffee-app      # Start app
docker stats coffee-app      # Monitor resources

# Cloudflare Tunnel Commands
sudo systemctl status cloudflared    # Check tunnel status
sudo systemctl restart cloudflared   # Restart tunnel
sudo journalctl -u cloudflared -f   # View tunnel logs
cloudflared tunnel list              # List all tunnels

# Testing Commands
curl http://localhost:8080          # Test local access
curl https://coffee.jagdevops.co.za # Test external access
nslookup coffee.jagdevops.co.za     # Check DNS
```

---

## Cost Summary

| Item | Cost | Notes |
|------|------|-------|
| Domain Name | $10-15/year | Required for professional setup |
| Cloudflare | FREE | Unlimited bandwidth, 50 users free |
| Home Server | ~$5/month electricity | Using existing computer |
| **Total** | **~$2/month** | Professional solution! |

---

## Support Resources

- **Cloudflare Tunnel Docs**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Docker Documentation**: https://docs.docker.com/
- **Cloudflare Community**: https://community.cloudflare.com/
- **This Project**: Update via Git or manual file replacement

---

## Summary

You now have a production-ready Seattle Coffee app that:
- ✅ Runs on your home server
- ✅ Accessible worldwide at `https://coffee.jagdevops.co.za`
- ✅ Protected by Cloudflare's network
- ✅ Supports 10+ authenticated users
- ✅ Works as mobile app (PWA)
- ✅ Costs almost nothing to run
- ✅ Automatically restarts on failure
- ✅ Updates easily with Docker

**Total Setup Time**: 30-45 minutes  
**Monthly Cost**: ~$2 (just electricity)  
**Result**: Enterprise-grade deployment from your home!

---

*Guide Version: 2.0.0*  
*Last Updated: January 2024*  
*Tested on: Ubuntu 22.04 LTS, Docker 24.0, Cloudflare Tunnel 2024.1*