# Secrets du blog IA

Suit le même mécanisme que les secrets existants (`SMTP_*`) : secret GitHub Actions
→ écrit dans `.env` par `.github/workflows/deploy.yml` → lu par le conteneur via
`env_file` dans `docker-compose.yaml`. Aucun changement de `docker-compose.yaml`
n'est nécessaire pour ajouter un secret : une ligne `echo "X=${{ secrets.X }}" >> .env`
de plus dans l'étape "Create .env file from GitHub Secrets" de `deploy.yml` suffit.

> Ce fichier fait office de `.env.example` pour la partie blog en attendant que
> `.env.example` (créé par la PR #28) soit fusionné dans cette lignée de branches —
> à consolider dans `.env.example` à ce moment-là.

## Phases 1-2 (livrées, PR #29 / #36)

| Variable | Rôle | Où l'obtenir |
|---|---|---|
| `ANTHROPIC_API_KEY` | Génération du texte de l'article (`services/blog/anthropicDraftGenerator.ts`) | console.anthropic.com |
| `IMAGE_GEN_API_KEY` | Génération de l'illustration de couverture via `gpt-image-1` (`services/blog/openaiImageGenerator.ts`) | platform.openai.com — **clé API**, distincte de l'abonnement ChatGPT (facturation séparée, voir note ci-dessous) |
| `GITHUB_BLOG_PAT` | Commit des brouillons sur `blog-draft/<slug>` (`services/blog/githubBlogRepo.ts`) | PAT *fine-grained*, limité au dépôt `elancestvous`, permission `Contents` en lecture/écriture uniquement (principe du moindre privilège — le code actuel lit/écrit du contenu et crée des branches, sans jamais toucher aux pull requests), avec expiration |
| `GITHUB_REPO` | Dépôt cible au format `owner/repo` (ex. `thacac/elancestvous`) | fixe |
| `BLOG_CRON_SECRET` | Authentifie l'appel `POST /api/blog/generate` envoyé par le cron GitHub Actions | à générer soi-même (chaîne aléatoire longue) |

### Note sur `IMAGE_GEN_API_KEY`

L'abonnement ChatGPT (grand public) et l'accès à l'API OpenAI sont facturés
séparément, même si c'est le même compte de connexion. Il faut générer une clé API
sur `platform.openai.com` et y ajouter un petit crédit prépayé (quelques dollars
suffisent pour un rythme hebdomadaire) — l'appel `gpt-image-1` n'est pas inclus
automatiquement dans un abonnement ChatGPT Plus.

### Note sur `GITHUB_BLOG_PAT`

Le `GITHUB_TOKEN` fourni automatiquement par GitHub Actions n'existe que pendant
l'exécution d'un workflow — il n'est pas accessible à l'app Next.js qui tourne en
continu sur le VPS et doit pouvoir écrire sur le dépôt à n'importe quel moment de la
semaine (typiquement, quand quelqu'un clique "Approuver" sur Discord). D'où un PAT
dédié à l'app plutôt qu'un jeton de run Actions.

## Phase 3-4 (à venir, issue #35 — pas encore utilisées par le code)

| Variable | Rôle |
|---|---|
| `DISCORD_BOT_TOKEN` | Poster/éditer les messages Discord (notification hebdomadaire, statut "Publié") |
| `DISCORD_PUBLIC_KEY` | Vérifier la signature Ed25519 des interactions entrantes (boutons/modale) |
| `DISCORD_CHANNEL_ID` | Salon Discord privé cible pour la notification hebdomadaire |
| `BLOG_REVIEW_SECRET` | Signe les tokens de prévisualisation à usage unique (`/blog-review/[slug]`) |

Ces variables seront ajoutées à ce document (et propagées dans `deploy.yml`) au
moment où la Phase 3 sera implémentée.
