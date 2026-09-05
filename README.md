# elancestvous

Site vitrine "Élan C'est Vous" — www.elancestvous.fr

Coaching individuel et collectif, formations QVCT/RPS et groupes d'analyse des
pratiques professionnelles (GAPP) pour établissements et soignants, à Toulouse et en
Occitanie.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui

## Installation

```bash
yarn install
yarn dev
```

Copiez `.env.example` en `.env` et renseignez les variables SMTP pour tester le
formulaire de contact en local (voir `docker-compose.dev.yaml` pour un MailHog local).

```bash
yarn build   # build de production
yarn lint    # eslint
yarn test    # vitest
```

## Palette

- Texte principal (`text-primary`) : `#112E40`
- Turquoise (logo, `--color-logo`) : `#29B5AD`
- Accent (`--color-accent`) : `#FF5A3D`
- Gris clair (`--color-accent-foreground`) : `#F1F5F9`

## Logo

Le logo est dans `public/logo-elancestvous.jpg`.

## Formulaire de contact

Le formulaire envoie un email via SMTP (`services/mailer/mailer.ts` +
`components/contact-form/action.ts`). Configurez `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USR`, `SMTP_PWD` (voir `.env.example`).

## Déploiement / CI-CD

Le site est buildé en image Docker, publiée sur GitHub Container Registry, puis
déployée sur un VPS Hostinger derrière un reverse-proxy Traefik (TLS Let's Encrypt).
Le pipeline (`.github/workflows/deploy.yml`) se déclenche sur push vers `master`.

Voir `DEPLOYMENT.md` pour le détail du pipeline, des secrets requis et du
dépannage.
