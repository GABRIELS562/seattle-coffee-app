# 🚀 Linux Server Deployment Guide

## Docker Deployment (Recommended)

### Prerequisites on Your Linux Server:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose -y

# (Optional) Add your user to docker group
sudo usermod -aG docker $USER
```

## Quick Deployment Options

### Option 1: Simple & Fast (5 minutes)
**HTTP only, accessible from anywhere with your server IP**

```bash
# On your Mac (in app directory)
./deploy-to-server.sh

# Choose option 1
# Edit the script first to add your server details:
# - SERVER_USER="your-linux-username"
# - SERVER_IP="your-server-ip"
```

Access at: `http://YOUR-SERVER-IP:8080`

### Option 2: With Password Protection (Recommended)
**HTTP + Basic Authentication**

```bash
# On your Mac
./deploy-to-server.sh

# Choose option 2
# Enter username and password when prompted
```

Access at: `http://YOUR-SERVER-IP:8080` (with login)

### Option 3: With HTTPS (Most Secure)
**Automatic SSL + Password Protection**

```bash
# On your Mac
./deploy-to-server.sh

# Choose option 3
# Works with domain OR IP address
```

Access at: `https://YOUR-SERVER-IP` or `https://your-domain.com`

## Manual Docker Deployment

### 1. Copy files to your server:
```bash
# From your Mac
scp -r . username@server-ip:/opt/seattle-coffee/
```

### 2. On your Linux server:
```bash
cd /opt/seattle-coffee

# Build Docker image
docker build -t seattle-coffee .

# Run with Docker (simple)
docker run -d \
  --name seattle-coffee \
  -p 8080:80 \
  --restart unless-stopped \
  seattle-coffee

# OR use Docker Compose (better)
docker-compose up -d
```

### 3. With Basic Authentication:
```bash
# Create password file
htpasswd -c .htpasswd yourusername

# Run with auth
docker run -d \
  --name seattle-coffee \
  -p 8080:80 \
  -v $(pwd)/nginx-auth.conf:/etc/nginx/conf.d/default.conf \
  -v $(pwd)/.htpasswd:/etc/nginx/.htpasswd \
  --restart unless-stopped \
  seattle-coffee
```

## Network Access Setup

### Make it accessible from outside:

#### 1. **Port Forwarding (Home Network)**
- Router admin panel → Port Forwarding
- Forward port 8080 (external) to SERVER-IP:8080 (internal)
- Access via: `http://YOUR-PUBLIC-IP:8080`

#### 2. **Using Cloudflare Tunnel (No Port Forwarding)**
```bash
# Install cloudflared on server
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Create tunnel
cloudflared tunnel create seattle-coffee
cloudflared tunnel route dns seattle-coffee coffee.yourdomain.com
cloudflared tunnel run --url http://localhost:8080 seattle-coffee
```

#### 3. **Using Tailscale (Private VPN)**
```bash
# Install Tailscale on server and devices
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Access via Tailscale IP (100.x.x.x)
```

#### 4. **Dynamic DNS (If no static IP)**
- Use DuckDNS, No-IP, or DynDNS
- Point to your public IP
- Access via: `http://yourname.duckdns.org:8080`

## Security Recommendations

### 1. **Always use authentication**
```bash
# Minimum: Basic Auth
# Better: HTTPS + Basic Auth
# Best: HTTPS + OAuth2 (using Authelia)
```

### 2. **Firewall setup**
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

### 3. **Use HTTPS (Free SSL)**
```bash
# Automatic with Caddy (included in docker-compose)
# Just set your domain in Caddyfile
```

### 4. **Monitor access**
```bash
# View access logs
docker logs seattle-coffee

# Real-time monitoring
docker logs -f seattle-coffee
```

## Quick Commands

```bash
# Check if running
docker ps

# Stop app
docker stop seattle-coffee

# Start app
docker start seattle-coffee

# Restart app
docker restart seattle-coffee

# Update app
git pull
docker build -t seattle-coffee .
docker restart seattle-coffee

# View logs
docker logs seattle-coffee -f

# Remove everything
docker stop seattle-coffee
docker rm seattle-coffee
docker rmi seattle-coffee
```

## Troubleshooting

### Can't access from outside:
1. Check firewall: `sudo ufw status`
2. Check port forwarding on router
3. Check Docker is running: `docker ps`
4. Test locally first: `curl localhost:8080`

### Permission denied:
```bash
sudo chown -R $USER:$USER /opt/seattle-coffee
```

### Port already in use:
```bash
# Change port in docker run command
-p 3000:80  # Use port 3000 instead
```

## Mobile Access

Once deployed:
1. Open `http://your-server-ip:8080` on phone
2. Add to home screen
3. Works like native app!

## 🎯 Recommended Setup

For private use from anywhere:
1. Use **Option 2** from deployment script (HTTP + Auth)
2. Set up **Cloudflare Tunnel** or **Tailscale**
3. Access securely from anywhere without exposing ports

Your app is now accessible from anywhere, privately! 🎉