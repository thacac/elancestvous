# Guide de déploiement

## Vue d'ensemble du pipeline réel

Le déploiement est piloté par `.github/workflows/deploy.yml`. Le job `build`
tourne sur tout push/PR vers **`master`** (pas `main`), mais le job `deploy` (celui
qui touche le VPS) ne se déclenche automatiquement **que** pour une publication de
blog approuvée sur Discord (commit tagué `[blog-auto-deploy]`, voir
`docs/blog-architecture.md`) — un push "de développement" ordinaire (merge de PR,
commit direct) construit l'image mais **n'écrase pas le VPS tout seul**. Le
déploiement final se déclenche donc manuellement (`workflow_dispatch`, onglet
Actions → Build and Deploy → Run workflow), pour garder la main sur le moment de
la mise en ligne.

1. **Job `build`** : build de l'image Docker (multi-stage, `output: 'standalone'`),
   push sur GitHub Container Registry avec deux tags
   (`ghcr.io/<owner>/elancestvous-nextjs-16:latest` et
   `ghcr.io/<owner>/elancestvous-nextjs-16:<sha-complet>`) — le tag par SHA
   garantit une cible de rollback fiable dans le registre, indépendante du
   cache Docker local du VPS.
2. **Job `deploy`** :
   - Écrit les secrets SMTP dans un fichier `.env` (checké dans le job, jamais
     commité) — voir `.env.example` pour la liste des variables.
   - Copie `docker-compose.yaml`, `infra/deploy.sh` et `.env`
     sur le VPS via SCP, dans `/home/$VPS_USR/elancestvous`.
   - Se connecte en SSH, s'authentifie auprès de GHCR avec le `GITHUB_TOKEN` du
     run, puis exécute `docker compose up -d --pull always`.

Le reverse-proxy en production est **Traefik** (voir les labels dans
`docker-compose.yaml` : routing sur `elancestvous.fr` / `www.elancestvous.fr`,
TLS via le resolver `letsencrypt`, redirection `www` → apex).

## Environnement de validation (recette) — `val.elancestvous.fr`

Pipeline de recette des features avant `master` :

```
feature/xxx ──PR──▶ validation ──(push = déploiement auto)──▶ https://val.elancestvous.fr
                         │ recette OK
feature/xxx ──PR──▶ master ──(workflow_dispatch)──▶ https://elancestvous.fr
```

- Les branches de feature sont mergées dans `validation` pour la recette, puis
  font leur PR habituelle vers `master`. Resynchroniser régulièrement
  `validation` avec `master` (`git merge origin/master`) pour que la Val reflète
  la prod + les features en cours.
- `.github/workflows/deploy-validation.yml` : à chaque push sur `validation`,
  build de l'image `ghcr.io/<owner>/elancestvous-nextjs-16:validation` (+
  `val-<sha>`, jamais `latest` ni le `<sha>` nu de la prod) avec
  `SITE_ENV=validation`, puis déploiement dans
  `/home/$VPS_USR/elancestvous-validation` via `docker-compose.validation.yaml`
  (projet compose `elancestvous-validation`, conteneur `elancestvous-validation`).
  Une PR vers `validation` ne fait que le build.
- Même VPS et même Traefik que la prod (routers/middlewares préfixés
  `elancestvous-validation`, réseau `elancestvous_default` partagé).
- **Invisible pour les robots** : basic auth Traefik, en-tête
  `X-Robots-Tag: noindex, nofollow, noarchive`, `robots.txt` en `Disallow: /`
  sans sitemap, et métadonnées `noindex/nofollow` (figées au build par
  `SITE_ENV=validation`, cf. `lib/featureFlags.ts`).
- **Pipeline blog neutralisé** : aucun secret Discord/GitHub/cron/Anthropic
  n'est transmis à la Val (routes `/api/blog/*` et `/api/discord/*` en 401) —
  elle ne peut ni poster sur Discord ni committer sur `master`. Pas de SMTP
  non plus : le formulaire de contact n'envoie rien depuis la Val.

### Mise en place (une seule fois)

1. **DNS** : enregistrement `A` (et `AAAA` le cas échéant) `val.elancestvous.fr`
   → IP du VPS. Traefik obtient le certificat Let's Encrypt au premier appel.
2. **Secret GitHub `VAL_BASIC_AUTH`** : une ligne htpasswd, générée localement
   (le déploiement échoue volontairement si ce secret est absent) :
   ```bash
   htpasswd -nbB recette 'mot-de-passe-solide'   # paquet apache2-utils
   ```
   Coller la sortie telle quelle (`recette:$2y$05$...`), sans doubler les `$`.
3. Créer la branche `validation` depuis `master` si elle n'existe pas, puis
   pousser dessus (ou Actions → *Build and Deploy (validation)* → Run workflow
   sur la branche `validation`).
4. Vérifier :
   ```bash
   curl -I https://val.elancestvous.fr                  # 401 attendu
   curl -I -u recette:... https://val.elancestvous.fr   # 200 + X-Robots-Tag
   curl -u recette:... https://val.elancestvous.fr/robots.txt   # Disallow: /
   ```

## Secrets GitHub requis (Settings → Secrets and variables → Actions)

| Secret | Rôle |
|---|---|
| `VPS_HOST` | IP/hostname du VPS |
| `VPS_USR` | Utilisateur SSH |
| `VPS_PASSWORD` | Mot de passe SSH (authentification par mot de passe, pas par clé — voir note sécurité ci-dessous) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USR`, `SMTP_PWD` | Envoi du formulaire de contact |
| `VAL_BASIC_AUTH` | Ligne htpasswd du basic auth de `val.elancestvous.fr` (workflow de validation uniquement) |

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
# Repérer le SHA du commit à restaurer (ex. via l'onglet Actions ou `git log`)
# Le tag correspondant existe dans le registre : ghcr.io/<owner>/elancestvous-nextjs-16:<sha-precedent>
cd /home/<user>/elancestvous
docker compose down
docker pull ghcr.io/<owner>/elancestvous-nextjs-16:<sha-precedent>
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
- **Pull d'image GHCR refusé sur le VPS** : vérifier que le package est accessible
  au dépôt et relancer le workflow afin d'obtenir un `GITHUB_TOKEN` de run valide.
- **Container ne démarre pas** : `docker logs elancestvous`, vérifier que `.env`
  contient bien toutes les variables de `.env.example`.
- **404/certificat invalide** : vérifier que Traefik tourne bien sur le VPS et
  qu'il est sur le même réseau Docker externe que le service `elancestvous`.
