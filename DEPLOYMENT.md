# Guide de déploiement

## Vue d'ensemble du pipeline réel

Le déploiement est piloté par `.github/workflows/deploy.yml`, déclenché sur push
vers la branche **`master`** (pas `main`) ou manuellement (`workflow_dispatch`).

1. **Job `build`** : build de l'image Docker (multi-stage, `output: 'standalone'`),
   push sur GitHub Container Registry
   (`ghcr.io/<owner>/elancestvous-nextjs-16:latest`).
2. **Job `deploy`** :
   - Écrit les secrets SMTP dans un fichier `.env` (checké dans le job, jamais
     commité) — voir `.env.example` pour la liste des variables.
   - Copie `docker-compose.yaml`, `infra/nginx.conf`, `infra/deploy.sh` et `.env`
     sur le VPS via SCP, dans `/home/$VPS_USR/elancestvous`.
   - Se connecte en SSH et exécute `docker compose up -d --pull always`.

Le reverse-proxy en production est **Traefik** (voir les labels dans
`docker-compose.yaml` : routing sur `elancestvous.fr` / `www.elancestvous.fr`,
TLS via le resolver `letsencrypt`, redirection `www` → apex). `infra/nginx.conf`,
`infra/init-ssl.sh` et `infra/renew.sh` viennent d'une configuration Nginx/Certbot
antérieure ; ils sont encore copiés sur le VPS par le workflow mais **ne sont plus
exécutés** — à nettoyer dans un futur sprint technique si Traefik reste la solution
retenue.

## Secrets GitHub requis (Settings → Secrets and variables → Actions)

| Secret | Rôle |
|---|---|
| `VPS_HOST` | IP/hostname du VPS |
| `VPS_USR` | Utilisateur SSH |
| `VPS_PASSWORD` | Mot de passe SSH (authentification par mot de passe, pas par clé — voir note sécurité ci-dessous) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USR`, `SMTP_PWD` | Envoi du formulaire de contact |

> **Note sécurité** : le déploiement utilise une authentification SSH par mot de
> passe (`VPS_PASSWORD`). Une authentification par clé (`ssh-keygen -t ed25519`,
> clé privée en secret, clé publique dans `~/.ssh/authorized_keys` sur le VPS) est
> recommandée et à planifier — remplacerait `VPS_PASSWORD` par un secret de clé
> privée dans `deploy.yml` (`appleboy/ssh-action` et `appleboy/scp-action`
> supportent déjà le paramètre `key` en alternative à `password`).

## Prérequis serveur

- Docker installé (`curl -fsSL https://get.docker.com | sh`)
- Le réseau Docker Traefik externe attendu par les labels de `docker-compose.yaml`
  doit déjà exister sur le VPS (Traefik lui-même est supposé tourner en dehors de
  ce dépôt — non inclus dans `docker-compose.yaml`)
- DNS : `elancestvous.fr` et `www.elancestvous.fr` pointant vers le VPS

## Déclencher un déploiement

```bash
git push origin master
```

Ou depuis l'onglet **Actions** → workflow **Build and Deploy** → **Run workflow**.

## Vérifier le déploiement

```bash
ssh <user>@<host>
docker ps
docker logs elancestvous
curl -I https://elancestvous.fr
```

## Rollback manuel

```bash
docker images | grep elancestvous-nextjs-16   # repérer un tag précédent (SHA)
cd /home/<user>/elancestvous
docker compose down
docker run -d --name elancestvous --restart unless-stopped \
  --env-file .env \
  --label traefik.enable=true \
  ghcr.io/<owner>/elancestvous-nextjs-16:<sha-precedent>
# puis relancer `docker compose up -d` une fois le correctif poussé
```

## Développement local

```bash
docker compose -f docker-compose.dev.yaml up -d   # MailHog pour tester les emails
yarn dev
```

## Dépannage

- **Build échoue** : vérifier `package.json` et les logs de l'onglet Actions.
- **`docker login ghcr.io` échoue sur le VPS** : le token utilisé est le
  `GITHUB_TOKEN` du run (éphémère) — relancer le workflow si le job de déploiement
  a expiré/timeout avant de pull l'image.
- **Container ne démarre pas** : `docker logs elancestvous`, vérifier que `.env`
  contient bien toutes les variables de `.env.example`.
- **404/certificat invalide** : vérifier que Traefik tourne bien sur le VPS et
  qu'il est sur le même réseau Docker externe que le service `elancestvous`.
