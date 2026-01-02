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
echo "Connexion au registre GhCR..."
n=0
until [ "$n" -ge 3 ]
do
   echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin && break
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

echo "Arrêt des anciens containers pour éviter les conflits..."
# Le down assure que les réseaux et containers sont supprimés avant le up
docker compose down --remove-orphans

echo "Démarrage des nouveaux containers..."
# On relance les containers. Nginx verra le nouveau nginx.conf grâce au volume.
docker compose up -d

echo "Nettoyage des images Docker obsolètes..."
# Supprime les images inutilisées pour libérer de l'espace
docker image prune -f