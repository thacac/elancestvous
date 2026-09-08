# Démarrage rapide

## Développement local

```bash
yarn install
cp .env.example .env   # renseigner SMTP_* si vous testez le formulaire de contact
yarn dev
```

## Déployer

Un push sur `master` build l'image Docker et la publie sur `ghcr.io`, mais ne
redéploie plus le VPS automatiquement (sauf publication de blog approuvée sur
Discord, voir `docs/blog-architecture.md`) :

```bash
git push origin master
```

Puis déclencher le déploiement final à la main : GitHub → onglet **Actions** →
**Build and Deploy** → **Run workflow** (branche `master`).

Secrets GitHub requis, prérequis serveur, dépannage, rollback : voir
**`DEPLOYMENT.md`**.
