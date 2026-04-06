#!/bin/bash
# À exécuter UNE SEULE FOIS sur le serveur pour obtenir le certificat initial.
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[$(date)] Obtention du certificat SSL initial..."
docker compose -f "$PROJECT_DIR/docker-compose.yaml" \
  --profile manual run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d elancestvous.fr -d www.elancestvous.fr \
  --email contact@elancestvous.fr --agree-tos --non-interactive

echo "[$(date)] Rechargement de nginx..."
docker compose -f "$PROJECT_DIR/docker-compose.yaml" exec nginx nginx -s reload

echo "[$(date)] Certificat obtenu avec succès."
