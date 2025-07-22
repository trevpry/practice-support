# Practice Support - Corporate Network Deployment Guide

This guide provides complete instructions for law firms and corporations to deploy the Practice Support application on their internal network infrastructure.

## Overview

Practice Support is a full-stack web application designed for law firm ediscovery and litigation support teams. This guide covers deployment options from simple local hosting to enterprise-grade server installations.

## System Requirements

### Minimum Hardware Requirements
- **CPU**: 2+ cores (4+ cores recommended)
- **RAM**: 4GB minimum (8GB+ recommended)
- **Storage**: 10GB free disk space (SSD recommended)
- **Network**: Ethernet connection (WiFi acceptable for testing)

### Operating System Support
- **Windows**: Windows 10/11, Windows Server 2019/2022
- **macOS**: macOS 10.15+ (Catalina or newer)
- **Linux**: Ubuntu 18.04+, CentOS 7+, RHEL 7+, Debian 9+

### Network Requirements
- **Ports**: 3000 (frontend), 5001 (backend API)
- **Firewall**: Inbound connections allowed on application ports
- **DNS**: Optional - can configure custom domain names

## Deployment Options

### Option 1: Development/Testing Setup (Simplest)
**Best for**: Small teams, testing, temporary use
**Complexity**: ⭐ (Beginner)
**Maintenance**: Manual start/stop required

### Option 2: Production Server Setup
**Best for**: Permanent deployment, medium to large teams
**Complexity**: ⭐⭐⭐ (Advanced)
**Maintenance**: Automatic startup, monitoring recommended

### Option 3: Docker Container Deployment
**Best for**: IT departments familiar with containerization
**Complexity**: ⭐⭐⭐⭐ (Expert)
**Maintenance**: Container orchestration tools

## Option 1: Development/Testing Setup

### Step 1: Prepare the Host Computer

1. **Choose a dedicated computer** (desktop or server):
   - This computer must remain powered on during business hours
   - Ensure stable network connection
   - Consider UPS (uninterruptible power supply) for reliability

2. **Create application directory**:
   ```
   Windows: C:\PracticeSupport\
   macOS/Linux: /opt/practice-support/
   ```

### Step 2: Install Required Software

#### Install Node.js (Required)

1. **Download Node.js**:
   - Visit: https://nodejs.org/
   - Download LTS version (v18 or higher)
   - Choose installer for your operating system

2. **Install Node.js**:
   - **Windows**: Run downloaded .msi file, follow installer
   - **macOS**: Run downloaded .pkg file, follow installer
   - **Linux**: Use package manager or download binary

3. **Verify installation**:
   ```bash
   node --version    # Should show v18.x.x or higher
   npm --version     # Should show npm version
   ```

#### Install Git (Required for downloading source code)

1. **Download Git**:
   - Visit: https://git-scm.com/downloads
   - Download for your operating system

2. **Install Git**:
   - Follow installer instructions
   - Accept default settings

3. **Verify installation**:
   ```bash
   git --version     # Should show git version
   ```

### Step 3: Download Application Source Code

1. **Open terminal/command prompt**:
   - **Windows**: Press Win+R, type `cmd`, press Enter
   - **macOS**: Press Cmd+Space, type Terminal, press Enter
   - **Linux**: Open terminal application

2. **Navigate to application directory**:
   ```bash
   # Windows
   cd C:\PracticeSupport

   # macOS/Linux
   cd /opt/practice-support
   ```

3. **Download source code**:
   ```bash
   git clone https://github.com/trevpry/practice-support.git
   cd practice-support
   ```

### Step 4: Install Application Dependencies

1. **Install all dependencies**:
   ```bash
   npm install
   ```
   
   This process may take 5-10 minutes depending on internet speed.

2. **Verify installation**:
   ```bash
   npm list --depth=0
   ```

### Step 5: Initialize Database

1. **Set up database**:
   ```bash
   cd server
   npx prisma migrate dev
   ```

2. **Verify database creation**:
   - Look for `dev.db` file in `server/prisma/` directory
   - This is your SQLite database file

### Step 6: Configure Network Access

#### Find Server IP Address

1. **Windows**:
   ```cmd
   ipconfig
   ```
   Look for "IPv4 Address" under your network adapter (e.g., 192.168.1.100)

2. **macOS/Linux**:
   ```bash
   ifconfig
   hostname -I
   ```
   Look for IP address (e.g., 192.168.1.100)

#### Configure Firewall

1. **Windows Firewall**:
   - Open Windows Security → Firewall & network protection
   - Click "Allow an app through firewall"
   - Add Node.js to allowed apps for both Private and Public networks

2. **macOS Firewall**:
   - System Preferences → Security & Privacy → Firewall
   - Click "Firewall Options"
   - Allow incoming connections for Node.js

3. **Linux (Ubuntu/Debian)**:
   ```bash
   sudo ufw allow 3000
   sudo ufw allow 5001
   ```

### Step 7: Start the Application

1. **Start development servers**:
   ```bash
   # From the practice-support root directory
   npm run dev
   ```

2. **Verify startup**:
   - You should see messages indicating both servers started
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5001

3. **Test local access**:
   - Open browser and navigate to http://localhost:3000
   - You should see the Practice Support dashboard

### Step 8: Test Network Access

1. **Access from another computer on the network**:
   - Replace YOUR_IP with the server's IP address
   - Navigate to: http://YOUR_IP:3000
   - Example: http://192.168.1.100:3000

2. **Test on mobile devices**:
   - Connect mobile device to same WiFi network
   - Open browser and navigate to server IP address

### Step 9: Create Initial Users and Data

1. **Access the application** from any networked device
2. **Create initial setup**:
   - Navigate to People page and create person records
   - Navigate to Users page and create user accounts
   - Link users to people for personalized dashboards
   - Create clients, matters, and other data as needed

## Option 2: Production Server Setup

### Step 1: Server Preparation

#### Choose Server Hardware
- **Dedicated server** or **virtual machine**
- **Windows Server** or **Linux server** recommended
- **Static IP address** on your network
- **Domain name** (optional but recommended)

#### Install Server Operating System
- **Windows Server 2019/2022** or **Ubuntu Server 20.04/22.04**
- **Configure static IP address**
- **Set up DNS records** (if using domain name)

### Step 2: Install Production Dependencies

#### Install Node.js Production Version
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

#### Install Process Manager (PM2)
```bash
sudo npm install -g pm2
```

#### Install Reverse Proxy (Nginx) - Optional
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### Step 3: Deploy Application Code

1. **Create application user**:
   ```bash
   sudo useradd -m -s /bin/bash practicesupport
   sudo su - practicesupport
   ```

2. **Clone and setup application**:
   ```bash
   git clone https://github.com/trevpry/practice-support.git
   cd practice-support
   npm install --production
   ```

3. **Build production assets**:
   ```bash
   npm run build
   ```

4. **Set up database**:
   ```bash
   cd server
   npx prisma migrate deploy
   cd ..
   ```

### Step 4: Configure Production Environment

#### Create PM2 Ecosystem File
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'practice-support',
    script: 'server/src/app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    }
  }]
}
```

#### Configure Nginx (Optional)
Create `/etc/nginx/sites-available/practice-support`:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    location / {
        root /home/practicesupport/practice-support/server/public;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 5: Start Production Services

1. **Start application with PM2**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

2. **Enable Nginx** (if using):
   ```bash
   sudo ln -s /etc/nginx/sites-available/practice-support /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Step 6: Configure Automatic Startup

#### Linux Systemd Service
Create `/etc/systemd/system/practice-support.service`:
```ini
[Unit]
Description=Practice Support Application
After=network.target

[Service]
Type=forking
User=practicesupport
WorkingDirectory=/home/practicesupport/practice-support
ExecStart=/usr/bin/pm2 start ecosystem.config.js
ExecReload=/usr/bin/pm2 reload ecosystem.config.js
ExecStop=/usr/bin/pm2 stop ecosystem.config.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable the service:
```bash
sudo systemctl enable practice-support
sudo systemctl start practice-support
```

## Database Backup and Maintenance

### Automated Backup Script

Create `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/practice-support"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="/home/practicesupport/practice-support/server/prisma/dev.db"

mkdir -p $BACKUP_DIR
cp $DB_FILE $BACKUP_DIR/database_backup_$DATE.db

# Keep only last 30 backups
find $BACKUP_DIR -name "database_backup_*.db" -mtime +30 -delete
```

### Schedule Daily Backups

Add to crontab:
```bash
sudo crontab -e
# Add this line:
0 2 * * * /opt/scripts/backup.sh
```

## Security Considerations

### Network Security
- **Use VPN** for remote access outside office network
- **Configure firewall rules** to restrict access to necessary ports only
- **Regular security updates** for server operating system
- **Monitor access logs** for suspicious activity

### Application Security
- **Change default ports** if required by security policy
- **Implement HTTPS** with SSL certificates for production
- **Regular backups** to secure, off-site location
- **User access controls** through application user management

### Data Protection
- **Database encryption at rest** (enterprise databases)
- **Regular security audits** of server configuration
- **Access logging** and monitoring
- **Compliance with firm security policies**

## Monitoring and Maintenance

### Application Monitoring
```bash
# Check application status
pm2 status

# View application logs
pm2 logs practice-support

# Monitor resource usage
pm2 monit
```

### System Monitoring
- **Disk space usage**: Monitor for database growth
- **Memory usage**: Ensure adequate RAM for user load
- **CPU usage**: Monitor during peak usage times
- **Network connectivity**: Ensure stable connection

### Regular Maintenance Tasks
1. **Weekly**: Check application logs for errors
2. **Monthly**: Review disk space and clean old logs
3. **Quarterly**: Update Node.js and dependencies
4. **Annually**: Review and update security configurations

## Troubleshooting Common Issues

### Application Won't Start
1. **Check Node.js version**: `node --version`
2. **Verify dependencies**: `npm install`
3. **Check database**: Ensure `dev.db` exists
4. **Review logs**: Check console output for errors

### Network Access Issues
1. **Verify firewall settings**: Ensure ports 3000/5001 are open
2. **Check IP address**: Ensure using correct server IP
3. **Test local access first**: Verify localhost:3000 works
4. **Network connectivity**: Ping server from client devices

### Performance Issues
1. **Check system resources**: CPU, memory, disk usage
2. **Monitor network bandwidth**: Ensure adequate speed
3. **Database optimization**: Consider moving to PostgreSQL for large datasets
4. **Scale horizontally**: Add additional servers for high user loads

### Database Issues
1. **Backup before changes**: Always backup before database migrations
2. **Check disk space**: Ensure adequate space for database growth
3. **Monitor query performance**: Review slow query logs
4. **Regular maintenance**: Run database optimization tasks

## Support and Updates

### Getting Updates
```bash
# Update application code
git pull origin main
npm install
npm run build

# Update database schema
cd server
npx prisma migrate deploy
cd ..

# Restart services
pm2 restart practice-support
```

### Getting Help
- **Documentation**: Refer to README.md for feature documentation
- **Issues**: Check GitHub repository for known issues
- **Community**: Engage with development community for support
- **Professional Support**: Consider consulting services for enterprise deployments

## Scaling for Large Organizations

### Database Scaling
- **PostgreSQL**: Migrate from SQLite to PostgreSQL for better performance
- **Database clustering**: Implement master-slave replication
- **Connection pooling**: Use connection pooling for high concurrent users

### Application Scaling
- **Load balancing**: Use Nginx or HAProxy for multiple application instances
- **Horizontal scaling**: Deploy multiple servers behind load balancer
- **CDN integration**: Use content delivery network for static assets
- **Caching**: Implement Redis for session and data caching

### Infrastructure Scaling
- **Container orchestration**: Use Docker and Kubernetes for enterprise deployment
- **Cloud deployment**: Consider AWS, Azure, or Google Cloud for scalability
- **Monitoring solutions**: Implement comprehensive monitoring with tools like Prometheus/Grafana
- **High availability**: Implement redundancy and failover mechanisms

---

## Quick Reference Commands

### Start Application (Development)
```bash
cd practice-support
npm run dev
```

### Start Application (Production)
```bash
pm2 start ecosystem.config.js
```

### View Logs
```bash
pm2 logs practice-support
```

### Stop Application
```bash
pm2 stop practice-support
```

### Database Backup
```bash
cp server/prisma/dev.db backup_$(date +%Y%m%d).db
```

### Update Application
```bash
git pull
npm install
npm run build
pm2 restart practice-support
```

---

*This deployment guide covers standard installation scenarios. For custom enterprise requirements, additional configuration may be necessary. Contact your IT department for assistance with advanced networking, security, or compliance requirements.*
