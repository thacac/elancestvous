#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[$(date)] Tentative de renouvellement du certificat SSL..."
docker compose -f "$PROJECT_DIR/docker-compose.yaml" \
  --profile manual run --rm certbot renew \
  --webroot -w /var/www/certbot \
  --quiet

echo "[$(date)] Rechargement de nginx..."
docker compose -f "$PROJECT_DIR/docker-compose.yaml" exec nginx nginx -s reload

echo "[$(date)] Terminé."
