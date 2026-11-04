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

Charte inspirée des slides de formation : 8 couleurs, un rôle chacune. Détail,
contrastes et règles d'usage dans
`_bmad-output/planning-artifacts/ux-designs/ux-elancestvous-2026-09-23/DESIGN.md`
(accessibilité : `.claude/rules/accessibilite.md`).

- Bleu nuit, texte et titres (`--color-primary`) : `#0A0C44`
- Pétrole, bandeaux et pied de page (`--color-petrol`) : `#015566`
- Turquoise vif, courbes et vagues (`--color-cyan`) : `#01A4B8`
- Turquoise du logo (`--color-logo`) : `#29B5AD`
- Orange vif, décor (`--color-orange`) : `#F28A1E`
- Orange foncé, texte et boutons (`--color-accent`) : `#A64D08`
- Pastels des cartes (`--color-sky`, `--color-peach`) : `#DFF7FA`, `#FDEFE2`

## Logo

Le logo (variante C) est dans `public/logo_elancestvous.svg` (avec étincelles : `public/logo_elancestvous_etincelles.svg`) ; le PNG `public/logo_elancestvous.png` sert aux données structurées. Dans le code : composant `Logo` de `components/charte/`.

## Formulaire de contact

Le formulaire envoie un email via SMTP (`services/mailer/mailer.ts` +
`components/contact-form/action.ts`). Configurez `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USR`, `SMTP_PWD` (voir `.env.example`).

## Blog

Blog Markdown alimenté chaque semaine par une IA (texte + illustration). Les
brouillons sont pour l'instant générés en zone de relecture sur GitHub, sans
validation ni publication automatique ; la validation humaine via Discord avant
publication est prévue en Phase 3 (voir issue #35, pas encore livrée). Voir
`docs/blog-architecture.md` pour le détail du pipeline, `docs/blog-secrets.md`
pour les secrets requis, et `docs/blog-charte-editoriale.md` pour les règles de
contenu.

## Déploiement / CI-CD

Le site est buildé en image Docker, publiée sur GitHub Container Registry, puis
déployée sur un VPS Hostinger derrière un reverse-proxy Traefik (TLS Let's Encrypt).
Le pipeline (`.github/workflows/deploy.yml`) construit l'image sur chaque push et
chaque pull request vers `master` (vérification), mais ne déploie sur le VPS que sur
déclenchement manuel explicitement sur `master` (`workflow_dispatch`) — jamais
depuis une PR ni depuis une branche de feature. Seule exception automatique : une
publication de blog approuvée sur Discord (commit tagué `[blog-auto-deploy]`, voir
`docs/blog-architecture.md`).

Voir `DEPLOYMENT.md` pour le détail du pipeline, des secrets requis et du
dépannage.
