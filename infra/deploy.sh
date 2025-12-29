#!/bin/bash
set -e

# Vérification de sécurité : si VPS_USR est vide, on arrête tout proprement
if [ -z "$VPS_USR" ]; then
  echo "Erreur : La variable VPS_USR est vide !"
  exit 1
fi

# On se place à la racine du projet là où est le docker-compose.yaml
cd /home/$VPS_USR/elancestvous

# Connexion sécurisée au registre
# Tentative de connexion (3 essais)
echo "Connexion au registre GHCR..."
n=0
until [ "$n" -ge 3 ]
do
   echo "$GH_TOKEN_ARG" | docker login ghcr.io -u "$GH_ACTOR_ARG" --password-stdin && break
   n=$((n+1)) 
   sleep 5
done

# Tentative de Pull (5 essais)
echo "Début du pull de l'image..."
n=0
until [ "$n" -ge 5 ]
do
   docker compose pull app && break
   n=$((n+1)) 
   echo "Échec du pull, nouvelle tentative dans 10s ($n/5)..."
   sleep 10
done
# On relance les containers. Nginx verra le nouveau nginx.conf grâce au volume.
docker compose up -d --remove-orphans

# Supprime les images inutilisées pour libérer de l'espace
docker image prune -f