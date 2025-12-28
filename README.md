# elancestvous
www.elancestvous.com website

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment.

### Features

- **Automated Docker Builds**: Automatically builds Docker images on push to main branch
- **GitHub Container Registry**: Images are pushed to ghcr.io
- **Automated Deployment**: Deploys to cloud server via SSH

### GitHub Actions Workflow

The workflow (`.github/workflows/deploy.yml`) includes:

1. **Build and Push Job**:
   - Builds Docker image using multi-stage build
   - Pushes to GitHub Container Registry (ghcr.io)
   - Tags images with branch name, SHA, and `latest` for main branch
   - Uses Docker layer caching for faster builds

2. **Deploy Job**:
   - Runs only on main branch pushes
   - Connects to cloud server via SSH
   - Pulls latest image from ghcr.io
   - Stops old container and starts new one
   - Runs on port 3000

### Required Secrets

Configure these secrets in your GitHub repository settings (Settings > Secrets and variables > Actions):

- `DEPLOY_HOST`: Cloud server hostname or IP address
- `DEPLOY_USER`: SSH username for deployment
- `DEPLOY_SSH_KEY`: Private SSH key for authentication
- `DEPLOY_PORT`: (Optional) SSH port, defaults to 22

### Docker Image

The Docker image is built using a multi-stage build:
- **Builder stage**: Installs dependencies and builds the Next.js application
- **Runner stage**: Minimal production image with only runtime dependencies

### Local Development

Use docker compose with .env.Development
```bash
docker compose --env-file ./.env.development up -d
```

To build and run locally:

```bash
# Build the Docker image
docker build -t elancestvous .

# Run the container
docker run -p 3000:3000 elancestvous
```

### Server Setup

On your cloud server, ensure Docker is installed:

```bash
# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Deployment Configuration

The deployment uses the following configuration:
- **Container name**: `elancestvous`
- **Port mapping**: 3000:3000
- **Restart policy**: unless-stopped
- **Image**: ghcr.io/thacac/elancestvous:latest

### Manual Deployment

To deploy manually:

```bash
# On the cloud server
docker pull ghcr.io/thacac/elancestvous:latest
docker stop elancestvous || true
docker rm elancestvous || true
docker run -d --name elancestvous --restart unless-stopped -p 3000:3000 ghcr.io/thacac/elancestvous:latest
```

### Next.js Configuration

For the Docker build to work with standalone output, ensure your `next.config.js` includes:

```javascript
module.exports = {
  output: 'standalone',
}
```

# ÉlanC’estVous – Site vitrine (Next.js 14 + Tailwind + shadcn/ui)

## Installation
```bash
yarn install
yarn dev
```

## Palette
- Turquoise (primary): #16BFBF
- Accent opposé: #FF5A3D
- Texte: #0F172A
- Gris clair: #F1F5F9

## Logo
Le logo est dans `public/logo-elancestvous.jpg`. Mettez le vôtre si besoin.

## Formulaire
Le formulaire envoie vers Formspree (placeholder). Remplacez l’URL par votre service
ou créez un endpoint `/app/api/contact/route.ts` et branchez un provider email.


# dpeloy on hostinger
`ssh ssh root@93.127.162.77
docker pull ghcr.io/thacac/elancestvous:latest
docker stop elancestvous || true
docker rm elancestvous || true
docker run -d --name elancestvous --restart unless-stopped -p 3000:3000 ghcr.io/thacac/elancestvous:latest
`