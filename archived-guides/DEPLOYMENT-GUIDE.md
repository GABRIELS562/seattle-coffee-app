# Seattle Coffee App - Complete Deployment Guide

## Table of Contents
- [Overview](#overview)
- [Deployment Options Comparison](#deployment-options-comparison)
- [Recommended Solution: Cloudflare Tunnel](#recommended-solution-cloudflare-tunnel)
- [Step-by-Step Cloudflare Tunnel Setup](#step-by-step-cloudflare-tunnel-setup)
- [User Authentication Options](#user-authentication-options)
- [Alternative Deployment Methods](#alternative-deployment-methods)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

## Overview

This guide provides comprehensive instructions for deploying the Seattle Coffee App for multiple users (5-50 users). The app is built with React and Capacitor, allowing deployment as:
- **Web Application** (via Docker/Cloudflare Tunnel) - Recommended
- **Native Mobile App** (iOS/Android)
- **Progressive Web App** (PWA)

## Deployment Options Comparison

| Solution | Setup Time | Cost | Max Users | Security | Pros | Cons |
|----------|------------|------|-----------|----------|------|------|
| **Cloudflare Tunnel** | 30 min | FREE | Unlimited | Excellent | Hidden IP, DDoS protection, Auto-SSL | Requires domain |
| **Port Forwarding + Nginx** | 45 min | FREE | Unlimited | Good | Direct control | Exposed IP, manual SSL |
| **Tailscale VPN** | 15 min | FREE (up to 100) | 100 | Excellent | Very secure, easy | Users need app |
| **Cloud Hosting (AWS/Azure)** | 2 hours | $5-50/mo | Unlimited | Excellent | Scalable, reliable | Monthly cost |
| **Ngrok** | 5 min | FREE (limited) | 40 concurrent | Good | Instant setup | Random URL, limited |

## Recommended Solution: Cloudflare Tunnel

**Why Cloudflare Tunnel is the best choice for 10+ users:**
- ✅ **FREE** for unlimited users
- ✅ **No port forwarding** required (router stays secure)
- ✅ **Hides your server IP** from the internet
- ✅ **Built-in DDoS protection** from Cloudflare
- ✅ **Automatic SSL certificates** (HTTPS)
- ✅ **Optional user authentication** (FREE for up to 50 users)
- ✅ **Custom domain support** (coffee.yourdomain.com)
- ✅ **99.99% uptime** with Cloudflare's infrastructure

## Step-by-Step Cloudflare Tunnel Setup

### Prerequisites
- A domain name (e.g., jagdevops.co.za)
- Linux server (Ubuntu/Debian recommended)
- Docker installed on server
- Basic terminal knowledge

### Phase 1: Cloudflare Account Setup

#### Step 1.1: Create Cloudflare Account
```bash
# Navigate to Cloudflare signup page
https://dash.cloudflare.com/sign-up

# Sign up with your email
# Verify email address
```
**Explanation:** Cloudflare provides free CDN, DNS, and tunnel services. The account gives you access to their global network.

#### Step 1.2: Add Your Domain to Cloudflare
```bash
# In Cloudflare Dashboard:
# 1. Click "Add a Site"
# 2. Enter: jagdevops.co.za
# 3. Select: FREE plan ($0/month)
# 4. Click: Continue
```
**Explanation:** Adding your domain allows Cloudflare to manage DNS and provide security features.

#### Step 1.3: Update Domain Nameservers
```bash
# Cloudflare will display 2 nameservers like:
nama.ns.cloudflare.com
john.ns.cloudflare.com

# Steps:
# 1. Login to your domain registrar (GoDaddy, Namecheap, etc.)
# 2. Find DNS/Nameserver settings
# 3. Change from default to Cloudflare nameservers
# 4. Save changes
```
**Explanation:** Nameservers tell the internet where to find your domain's DNS records. Pointing to Cloudflare enables their services.

**Wait Time:** 5 minutes to 24 hours for DNS propagation (usually under 1 hour)

### Phase 2: Server Application Setup

#### Step 2.1: SSH into Your Server
```bash
ssh username@your-server-ip
# Enter password when prompted
```
**Explanation:** SSH (Secure Shell) provides encrypted remote access to your server.

#### Step 2.2: Clone and Prepare Application
```bash
# Navigate to home directory
cd ~

# Clone your repository (if using Git)
git clone https://github.com/yourusername/seattle-coffee-app.git

# Or upload files via SCP if not using Git
scp -r /local/path/to/app username@server-ip:~/seattle-coffee-app

# Enter the application directory
cd seattle-coffee-app
```
**Explanation:** Gets your application code onto the server.

#### Step 2.3: Build and Run Docker Container
```bash
# Build Docker image from Dockerfile
# -t flag tags the image with a name
docker build -t seattle-coffee .
# This command:
# - Reads the Dockerfile
# - Creates a container image with your app
# - Tags it as "seattle-coffee"

# Run the container
# -d: detached mode (runs in background)
# -p 8080:80: maps port 8080 on host to port 80 in container
# --name: gives container a friendly name
# --restart always: auto-restart if it crashes or server reboots
docker run -d -p 8080:80 --name coffee-app --restart always seattle-coffee

# Verify container is running
docker ps
# Should show your coffee-app container with status "Up"

# Test locally
curl http://localhost:8080
# Should return HTML content of your app
```
**Explanation:** Docker containerizes your app for consistent deployment. The container runs isolated from the host system.

### Phase 3: Cloudflare Tunnel Installation

#### Step 3.1: Install Cloudflared
```bash
# For Ubuntu/Debian (recommended method):
# Download Cloudflare's GPG key for package verification
wget -q https://pkg.cloudflare.com/cloudflare-main.gpg
sudo mv cloudflare-main.gpg /usr/share/keyrings/cloudflare-archive-keyring.gpg

# Add Cloudflare repository
echo "deb [signed-by=/usr/share/keyrings/cloudflare-archive-keyring.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflared.list

# Update package list and install
sudo apt update
sudo apt install cloudflared

# Alternative for other Linux distributions:
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared

# Verify installation
cloudflared --version
# Should display version number like: cloudflared version 2024.1.0
```
**Explanation:** Cloudflared is the tunnel client that creates secure connection between your server and Cloudflare's network.

#### Step 3.2: Authenticate with Cloudflare
```bash
# Login to Cloudflare
cloudflared tunnel login

# This will output a URL like:
# https://dash.cloudflare.com/argotunnel?callback=...
# 
# 1. Copy and open this URL in your browser
# 2. Select your domain (jagdevops.co.za)
# 3. Click "Authorize"
```
**Explanation:** This creates an authentication certificate stored in `~/.cloudflared/cert.pem` that allows cloudflared to manage tunnels for your domain.

### Phase 4: Create and Configure Tunnel

#### Step 4.1: Create the Tunnel
```bash
# Create a new tunnel named "coffee-app"
cloudflared tunnel create coffee-app

# Output will show:
# Tunnel credentials written to /home/username/.cloudflared/TUNNEL-ID.json
# Created tunnel coffee-app with id: f5f5f5f5-a1b2-c3d4-e5f6-123456789abc

# Save the Tunnel ID (you'll need it)
TUNNEL_ID=f5f5f5f5-a1b2-c3d4-e5f6-123456789abc
```
**Explanation:** Creates a unique tunnel identified by UUID. The credentials file contains the secret key for this tunnel.

#### Step 4.2: Create Configuration File
```bash
# Create config directory if it doesn't exist
mkdir -p ~/.cloudflared

# Create configuration file
nano ~/.cloudflared/config.yml
```

Add this content (replace YOUR-TUNNEL-ID and YOUR-USERNAME):
```yaml
# Tunnel identifier (from step 4.1)
tunnel: YOUR-TUNNEL-ID

# Path to tunnel credentials
credentials-file: /home/YOUR-USERNAME/.cloudflared/YOUR-TUNNEL-ID.json

# Ingress rules - defines how traffic is routed
ingress:
  # Route coffee.jagdevops.co.za to local Docker container
  - hostname: coffee.jagdevops.co.za
    service: http://localhost:8080
    # Optional: Add headers
    originRequest:
      noTLSVerify: false
      connectTimeout: 30s
  
  # Catch-all rule (required)
  - service: http_status:404
```
**Explanation:** This configuration tells cloudflared:
- Which tunnel to use
- Where to find credentials
- How to route incoming traffic (coffee.jagdevops.co.za → localhost:8080)
- What to do with unmatched requests (return 404)

#### Step 4.3: Create DNS Route
```bash
# Create CNAME record pointing to tunnel
cloudflared tunnel route dns coffee-app coffee.jagdevops.co.za

# Output:
# 2024-01-15T10:30:00Z INF Added CNAME coffee.jagdevops.co.za which will route to this tunnel
```
**Explanation:** Creates a CNAME DNS record: `coffee.jagdevops.co.za → TUNNEL-ID.cfargotunnel.com`

### Phase 5: Run and Manage Tunnel

#### Step 5.1: Test Tunnel
```bash
# Run tunnel in foreground (for testing)
cloudflared tunnel run coffee-app

# You should see:
# 2024-01-15T10:35:00Z INF Starting tunnel tunnelID=...
# 2024-01-15T10:35:01Z INF Connection registered connIndex=0
# 2024-01-15T10:35:02Z INF Tunnel ready

# Press Ctrl+C to stop test run
```
**Explanation:** Runs tunnel in foreground so you can see logs and verify it's working.

#### Step 5.2: Install as System Service
```bash
# Install cloudflared as systemd service
sudo cloudflared service install

# Start the service
sudo systemctl start cloudflared

# Enable auto-start on boot
sudo systemctl enable cloudflared

# Check service status
sudo systemctl status cloudflared
# Should show: Active: active (running)

# View real-time logs
sudo journalctl -u cloudflared -f
```
**Explanation:** Systemd manages the tunnel as a background service that auto-starts on server reboot.

### Phase 6: Testing and Verification

#### Step 6.1: Test Access
```bash
# From your local machine or phone browser:
https://coffee.jagdevops.co.za

# Test with curl
curl -I https://coffee.jagdevops.co.za
# Should return: HTTP/2 200
```

#### Step 6.2: Verify SSL Certificate
```bash
# Check SSL certificate
echo | openssl s_client -connect coffee.jagdevops.co.za:443 2>/dev/null | openssl x509 -text | grep -E '(Subject:|Issuer:)'
# Should show Cloudflare SSL certificate
```

## User Authentication Options

### For 10 Users (FREE Options):

#### Option 1: Cloudflare Access (Recommended for 10 users)
**FREE for up to 50 users**

```bash
# In Cloudflare Dashboard:
# 1. Go to Zero Trust → Access → Applications
# 2. Click "Add an application"
# 3. Select "Self-hosted"
# 4. Configure:
```

**Application Configuration:**
```yaml
Application name: Seattle Coffee App
Session Duration: 24 hours
Application domain: coffee.jagdevops.co.za

# Authentication Policy:
Policy name: Authorized Users
Action: Allow

# Add authentication methods (choose one):

# Option A: Email OTP (simplest)
Include:
  - Emails ending in: @yourcompany.com
  OR
  - Email addresses:
    - user1@gmail.com
    - user2@yahoo.com
    - (up to 50 individual emails)

# Option B: Google OAuth (if all users have Google accounts)
Include:
  - Google GSuite groups: coffee-users@yourcompany.com

# Option C: GitHub OAuth (for technical teams)
Include:
  - GitHub organizations: your-org-name
```

**Explanation:** Cloudflare Access adds authentication layer before users reach your app. Users must verify identity before accessing.

#### Option 2: Basic Auth via Docker (Simpler but less secure)

Create password file:
```bash
# Install apache2-utils for htpasswd
sudo apt-get install apache2-utils

# Create password file
htpasswd -c /home/username/coffee-passwords user1
# Enter password when prompted

# Add more users
htpasswd /home/username/coffee-passwords user2
htpasswd /home/username/coffee-passwords user3
# ... repeat for all 10 users
```

Update Docker run command:
```bash
# Stop existing container
docker stop coffee-app
docker rm coffee-app

# Run with password file mounted
docker run -d \
  -p 8080:80 \
  --name coffee-app \
  --restart always \
  -v /home/username/coffee-passwords:/etc/nginx/.htpasswd \
  seattle-coffee
```

### For 50+ Users:

Consider these options:
1. **Cloudflare Access** - FREE up to 50 users, then $3/user/month
2. **Auth0** - Free tier: 7,000 active users
3. **Firebase Auth** - Free tier: 10,000 verifications/month
4. **Keycloak** - Open source, self-hosted, unlimited users

## Alternative Deployment Methods

### Method 2: Direct Port Forwarding + Let's Encrypt

If you prefer not using Cloudflare:

```bash
# Install Nginx
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/coffee

# Add configuration:
server {
    server_name coffee.jagdevops.co.za;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/coffee /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d coffee.jagdevops.co.za

# Configure router:
# Forward ports 80 and 443 to your server IP
```

### Method 3: Deploy to Cloud (AWS/DigitalOcean/Azure)

Example with DigitalOcean:
```bash
# Create $5/month droplet
# SSH into droplet
# Follow same Docker + Cloudflare Tunnel steps above
```

## Troubleshooting

### Common Issues and Solutions:

#### DNS Not Resolving
```bash
# Check DNS propagation
nslookup coffee.jagdevops.co.za
dig coffee.jagdevops.co.za

# Solution: Wait for propagation or flush DNS
# Windows: ipconfig /flushdns
# Mac: sudo dscacheutil -flushcache
# Linux: sudo systemd-resolve --flush-caches
```

#### Tunnel Not Connecting
```bash
# Check tunnel status
cloudflared tunnel list

# View detailed logs
sudo journalctl -u cloudflared -n 100

# Restart tunnel
sudo systemctl restart cloudflared

# Verify credentials exist
ls -la ~/.cloudflared/
```

#### Docker Container Issues
```bash
# Check container status
docker ps -a

# View container logs
docker logs coffee-app

# Restart container
docker restart coffee-app

# Rebuild if needed
docker stop coffee-app
docker rm coffee-app
docker build -t seattle-coffee . --no-cache
docker run -d -p 8080:80 --name coffee-app --restart always seattle-coffee
```

#### 502 Bad Gateway Error
```bash
# Verify app is running locally
curl http://localhost:8080

# Check if port is open
sudo netstat -tlnp | grep 8080

# Check firewall
sudo ufw status
sudo ufw allow 8080/tcp
```

## Security Best Practices

### 1. Keep Software Updated
```bash
# Update system packages weekly
sudo apt update && sudo apt upgrade

# Update Docker images monthly
docker pull node:18-alpine
docker pull nginx:alpine

# Update cloudflared quarterly
sudo apt update && sudo apt install --only-upgrade cloudflared
```

### 2. Monitor Access Logs
```bash
# View tunnel metrics in Cloudflare Dashboard
# Zero Trust → Analytics

# Monitor local logs
sudo journalctl -u cloudflared -f

# Docker logs
docker logs coffee-app --follow
```

### 3. Implement Rate Limiting
In Cloudflare Dashboard:
- Security → WAF → Rate limiting rules
- Create rule: 100 requests per minute per IP

### 4. Enable Cloudflare Security Features
- Security → Settings:
  - Enable "Bot Fight Mode"
  - Set Security Level to "Medium"
  - Enable "Browser Integrity Check"
  - Enable "Challenge Passage"

### 5. Backup Configuration
```bash
# Backup tunnel config
cp -r ~/.cloudflared ~/cloudflared-backup-$(date +%Y%m%d)

# Backup Docker data
docker save seattle-coffee > seattle-coffee-backup.tar
```

## Performance Optimization

### Enable Cloudflare Caching
In Cloudflare Dashboard:
```yaml
Caching → Configuration:
  - Browser Cache TTL: 4 hours
  - Always Online: ON
  
Page Rules → Create:
  - URL: coffee.jagdevops.co.za/*
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
```

### Docker Optimization
```bash
# Use multi-stage build (already in Dockerfile)
# Limit container resources
docker run -d \
  -p 8080:80 \
  --name coffee-app \
  --restart always \
  --memory="512m" \
  --cpus="0.5" \
  seattle-coffee
```

## Monitoring and Maintenance

### Setup Uptime Monitoring
1. Use UptimeRobot (free):
   - Add monitor for https://coffee.jagdevops.co.za
   - Set check interval: 5 minutes
   - Alert via email/SMS

2. Cloudflare Analytics:
   - View in Zero Trust → Analytics
   - Monitor request counts, response times

### Automated Backups
Create backup script:
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/home/username/backups"
DATE=$(date +%Y%m%d)

# Backup Docker container
docker commit coffee-app coffee-app-backup:$DATE
docker save coffee-app-backup:$DATE | gzip > $BACKUP_DIR/coffee-app-$DATE.tar.gz

# Cleanup old backups (keep last 7)
find $BACKUP_DIR -name "coffee-app-*.tar.gz" -mtime +7 -delete

# Add to crontab for daily execution
# crontab -e
# 0 2 * * * /home/username/backup.sh
```

## Cost Analysis

### Cloudflare Tunnel Solution (RECOMMENDED)
- **Domain**: $10-15/year
- **Cloudflare**: FREE (unlimited bandwidth)
- **Home Server**: Electricity ~$5/month
- **Total**: ~$2/month

### Alternative Costs:
- **Cloud VPS**: $5-20/month
- **Ngrok Pro**: $8/month
- **Tailscale**: FREE up to 100 users, then $5/user/month

## Conclusion

**For 10 users**, Cloudflare Tunnel is the optimal solution:
- ✅ Completely FREE (except domain)
- ✅ Professional setup (https://coffee.yourdomain.com)
- ✅ Enterprise-grade security
- ✅ No exposed ports or IP
- ✅ Built-in authentication options
- ✅ Scales to 50+ users without infrastructure changes

The setup takes approximately 30-45 minutes and provides a production-ready deployment that rivals expensive cloud solutions.

## Support and Resources

- **Cloudflare Tunnel Docs**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Docker Docs**: https://docs.docker.com/
- **Cloudflare Community**: https://community.cloudflare.com/
- **Status Page**: https://www.cloudflarestatus.com/

## Quick Command Reference

```bash
# Check tunnel status
cloudflared tunnel list
sudo systemctl status cloudflared

# View logs
sudo journalctl -u cloudflared -f
docker logs coffee-app

# Restart services
sudo systemctl restart cloudflared
docker restart coffee-app

# Update tunnel configuration
nano ~/.cloudflared/config.yml
sudo systemctl restart cloudflared

# Monitor resources
docker stats coffee-app
htop
```

---
*Last updated: January 2024*
*Guide version: 1.0.0*