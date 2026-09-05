# CI/CD — architecture

Référence courte des fichiers qui composent le pipeline. Pour les secrets, le
déclenchement et le dépannage, voir `DEPLOYMENT.md` (source de vérité).

| Fichier | Rôle |
|---|---|
| `Dockerfile` | Build multi-stage Next.js (`output: 'standalone'`), utilisateur non-root en runtime |
| `.dockerignore` | Exclut `node_modules`, `.git`, `.next`, etc. du contexte de build |
| `.github/workflows/deploy.yml` | Build + push GHCR + déploiement SSH sur push `master` |
| `docker-compose.yaml` | Service de production, labels Traefik (routing + TLS) |
| `docker-compose.dev.yaml` | MailHog pour tester les emails en local |
| `infra/deploy.sh` | Script de déploiement alternatif (login GHCR + pull + up), copié sur le VPS mais non appelé par `deploy.yml` (qui exécute directement `docker compose up -d --pull always`) |

## Tags d'image

`ghcr.io/<owner>/elancestvous-nextjs-16:latest` (un seul tag géré aujourd'hui, pas
de tag par SHA/branche).

## Sécurité

- Image runtime minimale, utilisateur non-root.
- Registre GHCR privé par défaut.
- Authentification SSH du déploiement actuellement par **mot de passe**
  (`VPS_PASSWORD`) — migration vers clé SSH recommandée, voir `DEPLOYMENT.md`.
