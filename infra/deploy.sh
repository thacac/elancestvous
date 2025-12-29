#!/bin/bash
set -e

# On se place à la racine du projet là où est le docker-compose.yaml
cd /home/$VPS_USR/elancestvous

# Connexion sécurisée au registre
echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin

# On pull spécifiquement l'image de l'app
docker compose pull app

# On relance les containers. Nginx verra le nouveau nginx.conf grâce au volume.
docker compose up -d --remove-orphans

# Supprime les images inutilisées pour libérer de l'espace
docker image prune -f