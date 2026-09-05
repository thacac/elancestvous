# Démarrage rapide

## Développement local

```bash
yarn install
cp .env.example .env   # renseigner SMTP_* si vous testez le formulaire de contact
yarn dev
```

## Déployer

Le déploiement est entièrement automatisé : un push sur `master` build l'image
Docker, la publie sur `ghcr.io` et redéploie le VPS via Traefik.

```bash
git push origin master
```

Secrets GitHub requis, prérequis serveur, dépannage, rollback : voir
**`DEPLOYMENT.md`**.
