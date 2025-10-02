# Quick Start Guide

## Getting Started in 5 Minutes

### Step 1: Configure GitHub Secrets (2 minutes)

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets by clicking **New repository secret**:

```
DEPLOY_HOST = your-server.com (or IP address)
DEPLOY_USER = ubuntu (or your SSH username)
DEPLOY_SSH_KEY = (paste your private SSH key)
DEPLOY_PORT = 22 (optional, only if not using default)
```

### Step 2: Prepare Your Server (3 minutes)

SSH to your server and run:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Exit and re-login for Docker permissions to take effect
exit
```

SSH back in and add your public key:

```bash
# Add the public key corresponding to DEPLOY_SSH_KEY
echo "your-public-key-here" >> ~/.ssh/authorized_keys
```

### Step 3: Deploy! (Automatic)

Push any commit to the `main` branch:

```bash
git add .
git commit -m "Trigger deployment"
git push origin main
```

Or use the GitHub UI:
1. Go to **Actions** tab
2. Select **Build and Deploy** workflow
3. Click **Run workflow** → **Run workflow**

### Step 4: Verify

1. **Check GitHub Actions**: Go to Actions tab, watch the workflow run
2. **Check your server**:
   ```bash
   ssh user@your-server.com
   docker ps                    # See running container
   docker logs elancestvous     # View app logs
   curl http://localhost:3000   # Test the app
   ```
3. **Access from browser**: `http://your-server-ip:3000`

## That's It! 🎉

Your app is now automatically deployed whenever you push to main.

## What Happens Next?

- **Every push to main** → Automatic build & deploy
- **Pull requests** → Build only (no deployment)
- **Manual trigger** → Use GitHub Actions UI

## Optional: Production Setup

### Add a Domain Name and SSL

1. **Point your domain to the server**:
   - Add an A record: `elancestvous.com` → `your-server-ip`
   - Add an A record: `www.elancestvous.com` → `your-server-ip`

2. **Install Nginx** on your server:
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```

3. **Configure Nginx** (`/etc/nginx/sites-available/elancestvous`):
   ```nginx
   server {
       listen 80;
       server_name elancestvous.com www.elancestvous.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/elancestvous /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Get SSL certificate**:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d elancestvous.com -d www.elancestvous.com
   ```

Now access your site at: `https://elancestvous.com` 🔒

## Need Help?

- **Detailed instructions**: See `DEPLOYMENT.md`
- **Implementation details**: See `CI-CD-IMPLEMENTATION.md`
- **Troubleshooting**: See `DEPLOYMENT.md` → Troubleshooting section

## Common Issues

### "Permission denied" when deploying
- Verify SSH key is correct in GitHub secrets
- Test SSH manually: `ssh -i your-key user@server`
- Check key permissions: `chmod 600 your-key`

### "Cannot connect to Docker daemon"
- Ensure Docker is running: `sudo systemctl start docker`
- Ensure user is in docker group: `sudo usermod -aG docker $USER`
- Log out and back in after adding to group

### Container not starting
- Check logs: `docker logs elancestvous`
- Check if port is in use: `sudo netstat -tulpn | grep 3000`
- Try running manually: `docker run -p 3000:3000 ghcr.io/thacac/elancestvous:latest`

### Build fails on GitHub Actions
- Verify `package.json` has proper scripts
- Check if all dependencies are listed
- Review error logs in Actions tab
