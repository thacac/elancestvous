# Deployment Guide

## Prerequisites

1. **GitHub Repository**: Ensure the repository is properly configured
2. **Cloud Server**: A server with Docker installed
3. **SSH Access**: SSH key-based authentication to the server

## Setup Steps

### 1. Configure GitHub Secrets

Go to your repository settings: `Settings > Secrets and variables > Actions > New repository secret`

Add the following secrets:

- **DEPLOY_HOST**: Your cloud server's hostname or IP address
  - Example: `server.example.com` or `192.168.1.100`

- **DEPLOY_USER**: SSH username for deployment
  - Example: `ubuntu` or `deploy`

- **DEPLOY_SSH_KEY**: Private SSH key for authentication
  - Generate a new key pair if needed:
    ```bash
    ssh-keygen -t ed25519 -C "github-actions-deploy"
    ```
  - Copy the entire private key content (including headers)
  - Add the public key to the server's `~/.ssh/authorized_keys`

- **DEPLOY_PORT** (Optional): SSH port if not using default 22
  - Example: `2222`

### 2. Prepare Your Cloud Server

#### Install Docker

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
```

#### Configure Firewall (if applicable)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS if using reverse proxy
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow application port (adjust as needed)
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable
```

#### Setup SSH Access

```bash
# On your local machine, add the public key to the server
ssh-copy-id -i ~/.ssh/deploy_key.pub user@server.example.com

# Test SSH connection
ssh -i ~/.ssh/deploy_key user@server.example.com
```

### 3. Configure Package Permissions

For the Docker image to be accessible:

1. Go to your repository on GitHub
2. Navigate to the package (after first push): `Packages` tab
3. Click on your package `elancestvous`
4. Go to `Package settings`
5. Under "Manage Actions access", ensure the repository has read access

### 4. Trigger Deployment

Once everything is configured:

1. Push to the `main` branch or merge a PR
2. GitHub Actions will automatically:
   - Build the Docker image
   - Push to ghcr.io
   - Deploy to your cloud server

Monitor the deployment in the `Actions` tab of your repository.

### 5. Verify Deployment

After deployment completes:

```bash
# SSH to your server
ssh user@server.example.com

# Check if container is running
docker ps

# View container logs
docker logs elancestvous

# Check application health
curl http://localhost:3000
```

### 6. Setup Reverse Proxy (Optional)

For production, use Nginx or Caddy as a reverse proxy:

#### Using Nginx:

```bash
# Install Nginx
sudo apt-get install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/elancestvous
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name elancestvous.com www.elancestvous.com;

    location / {
        proxy_pass http://localhost:3000;
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
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/elancestvous /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### Setup SSL with Certbot:

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d elancestvous.com -d www.elancestvous.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Troubleshooting

### Build Fails

- Check if `package.json` exists with proper scripts
- Ensure `next.config.js` has `output: 'standalone'`
- Review GitHub Actions logs in the Actions tab

### Deployment Fails

- Verify SSH secrets are correct
- Check SSH key has proper permissions (600)
- Ensure Docker is installed on the server
- Check server firewall settings

### Container Won't Start

```bash
# Check container logs
docker logs elancestvous

# Check if port 3000 is available
sudo netstat -tulpn | grep 3000

# Inspect the image
docker inspect ghcr.io/thacac/elancestvous:latest
```

### Cannot Pull Image from ghcr.io

```bash
# Login to GitHub Container Registry
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Make sure the package is public or you have access
# Check package settings in GitHub
```

## Environment Variables

To add environment variables to your deployment:

1. Create a `.env` file on your server (optional)
2. Modify the deployment script in `.github/workflows/deploy.yml`:

```yaml
docker run -d \
  --name elancestvous \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file /path/to/.env \
  ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
```

Or pass them directly:

```yaml
docker run -d \
  --name elancestvous \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=${{ secrets.DATABASE_URL }} \
  ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
```

## Rollback

If a deployment fails, rollback to a previous version:

```bash
# On the server, find the previous image tag
docker images | grep elancestvous

# Stop current container
docker stop elancestvous
docker rm elancestvous

# Run previous version
docker run -d \
  --name elancestvous \
  --restart unless-stopped \
  -p 3000:3000 \
  ghcr.io/thacac/elancestvous:PREVIOUS_TAG
```

## Monitoring

Consider setting up monitoring:

- **Docker logs**: `docker logs -f elancestvous`
- **Resource usage**: `docker stats elancestvous`
- **Health checks**: Add health endpoints to your Next.js app
- **External monitoring**: Use services like UptimeRobot, Pingdom, or DataDog
