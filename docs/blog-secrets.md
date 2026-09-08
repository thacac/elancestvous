# Secrets du blog IA

Suit le même mécanisme que les secrets existants (`SMTP_*`) : secret GitHub Actions
→ écrit dans `.env` par `.github/workflows/deploy.yml` → lu par le conteneur via
`env_file` dans `docker-compose.yaml`. Aucun changement de `docker-compose.yaml`
n'est nécessaire pour ajouter un secret : une ligne `echo "X=${{ secrets.X }}" >> .env`
de plus dans l'étape "Create .env file from GitHub Secrets" de `deploy.yml` suffit.

## Phases 1-2 (livrées, PR #29 / #36)

| Variable | Rôle | Où l'obtenir |
|---|---|---|
| `ANTHROPIC_API_KEY` | Génération du texte de l'article (`services/blog/anthropicDraftGenerator.ts`) | console.anthropic.com |
| `IMAGE_GEN_API_KEY` | Génération de l'illustration de couverture via `gpt-image-1` (`services/blog/openaiImageGenerator.ts`) | platform.openai.com — **clé API**, distincte de l'abonnement ChatGPT (facturation séparée, voir note ci-dessous) |
| `GH_PAT_TOKEN` | Commit des brouillons sur `blog-draft/<slug>` (`services/blog/githubBlogRepo.ts`) | PAT *fine-grained*, limité au dépôt `elancestvous`, permission `Contents` en lecture/écriture uniquement (principe du moindre privilège — le code actuel lit/écrit du contenu et crée des branches, sans jamais toucher aux pull requests), avec expiration |
| `GITHUB_REPO` | Dépôt cible au format `owner/repo` (ex. `thacac/elancestvous`) | fixe |
| `BLOG_CRON_SECRET` | Authentifie les appels `POST /api/blog/generate` (cron hebdomadaire) et `POST /api/blog/veille` (cron quotidien, `.github/workflows/blog-veille-trigger.yml`) envoyés par GitHub Actions — un seul secret pour les deux | à générer soi-même (chaîne aléatoire longue) |

### Note sur `IMAGE_GEN_API_KEY`

L'abonnement ChatGPT (grand public) et l'accès à l'API OpenAI sont facturés
séparément, même si c'est le même compte de connexion. Il faut générer une clé API
sur `platform.openai.com` et y ajouter un petit crédit prépayé (quelques dollars
suffisent pour un rythme hebdomadaire) — l'appel `gpt-image-1` n'est pas inclus
automatiquement dans un abonnement ChatGPT Plus.

### Note sur `GH_PAT_TOKEN`

Le `GITHUB_TOKEN` fourni automatiquement par GitHub Actions n'existe que pendant
l'exécution d'un workflow — il n'est pas accessible à l'app Next.js qui tourne en
continu sur le VPS et doit pouvoir écrire sur le dépôt à n'importe quel moment de la
semaine (typiquement, quand quelqu'un clique "Approuver" sur Discord). D'où un PAT
dédié à l'app plutôt qu'un jeton de run Actions.

Nommé `GH_PAT_TOKEN` et non `GITHUB_BLOG_PAT` (nom initialement prévu) : GitHub
refuse tout secret de dépôt dont le nom commence par `GITHUB_`, préfixe réservé à
ses propres variables.

## Phase 3-4 (livrées — issue #35)

| Variable | Rôle | Où l'obtenir |
|---|---|---|
| `DISCORD_BOT_TOKEN` | Poster le message hebdomadaire (`services/blog/discordNotifier.ts`) | Discord Developer Portal → application → onglet **Bot** → Reset Token |
| `DISCORD_PUBLIC_KEY` | Vérifier la signature Ed25519 des interactions entrantes (`lib/discordSignature.ts`) — pas un secret au sens strict, sert à vérifier, pas à s'authentifier | Onglet **General Information** → Public Key |
| `DISCORD_CHANNEL_ID` | Salon Discord privé cible pour la notification hebdomadaire | Mode développeur activé → clic droit sur le salon → Copier l'identifiant |
| `DISCORD_VEILLE_CHANNEL_ID` | *Optionnel* — salon dédié aux propositions de la veille actualité (`services/blog/discordNotifier.ts::notifyActualiteProposal`, issue #66), pour ne pas les noyer parmi les brouillons prêts à valider. Laisser vide pour tout poster dans `DISCORD_CHANNEL_ID` (comportement actuel) | Même méthode que `DISCORD_CHANNEL_ID`, sur un second salon |
| `BLOG_REVIEW_SECRET` | Signe les tokens de prévisualisation (`lib/reviewToken.ts`, `/blog-review/[slug]`) | À générer soi-même (`openssl rand -hex 32`) |

Le clic sur "Approuver" publie réellement l'article (greffe des blobs déjà commités
sur `blog-draft/<slug>` vers un nouveau commit `master`, `services/blog/publishDraft.ts`)
et "Retoucher" relance réellement Claude avec les retours saisis dans la modale
(`services/blog/reviseDraft.ts`), recommite sur la même branche et renotifie Discord.
Aucun secret supplémentaire par rapport à la liste ci-dessus — mêmes jetons que la
Phase 3, simplement branchés sur des actions réelles plutôt que sur une simple mise à
jour du message Discord. Voir `docs/blog-architecture.md`.

**Non implémenté** : le plafond de 3 allers-retours de retouche évoqué dans le plan
initial — chaque clic "Retoucher" relance Claude sans limite de tentatives.

## Commande /blog-sujet (issue #67)

| Variable | Rôle | Où l'obtenir |
|---|---|---|
| `DISCORD_APPLICATION_ID` | Enregistrement de la commande slash `/blog-sujet` (`yarn blog:register-discord-command`, `scripts/registerDiscordCommand.ts`) — pas requis par le runtime de l'app, seulement pour ce script manuel ponctuel | Discord Developer Portal → application → onglet **General Information** → Application ID |

Aucun autre secret : la lecture/écriture de `content/blog/sujets-discord.json`
réutilise `GH_PAT_TOKEN`, la réponse à la modale réutilise `DISCORD_PUBLIC_KEY`
(vérification de signature déjà en place sur `/api/discord/interactions`).
`/blog-sujet` est ouverte à tout le salon Discord, sans vérification d'identité
(décision assumée, cf. issue #67) — `SYSTEM_PROMPT` reste la seule protection
en aval contre une tentative d'injection de prompt via le champ "sujet"/"notes".

## Optionnel — réglage coût/modèle (`services/blog/anthropicDraftGenerator.ts`)

| Variable | Rôle | Défaut si absente |
|---|---|---|
| `ANTHROPIC_BLOG_MODEL` | Modèle Claude utilisé pour `parseDraft`/`reviseDraft` | `claude-opus-5` |
| `ANTHROPIC_BLOG_EFFORT` | `output_config.effort` (`low`/`medium`/`high`/`xhigh`/`max`) | non défini — effort adaptatif par défaut du SDK |

Chaque appel logue déjà (`console.log`, préfixe `[blog/anthropic]`) les tokens
consommés et un coût estimé en dollars, à partir d'une petite table de tarifs
codée en dur dans `anthropicDraftGenerator.ts` — à mettre à jour si un nouveau
modèle est configuré via `ANTHROPIC_BLOG_MODEL`. Ne pas changer `ANTHROPIC_BLOG_EFFORT`
sans avoir d'abord comparé la qualité obtenue : `yarn blog:compare-models`
(`scripts/compareDraftModels.ts`) génère le même article avec plusieurs couples
modèle/effort pour comparer coût et qualité avant de changer le réglage en
production — appelle réellement l'API Anthropic et dépense de l'argent, réservé à
un usage manuel ponctuel.

## Optionnel — veille actualité (issue #66, révisée : mix RSS + tri IA)

| Variable | Rôle | Défaut si absente |
|---|---|---|
| `BLOG_VEILLE_SOURCES` | Liste de flux RSS/Atom séparés par des virgules, interrogés puis triés par IA (`services/blog/actualiteWatch.ts`) — voir `.env.example` pour la liste vérifiée au moment de l'écriture | vide — veille désactivée, repli automatique sur la rotation de piliers (#52) |

Pas de secret dédié pour l'étape de tri : elle réutilise `ANTHROPIC_API_KEY`
ci-dessus (Haiku, sortie structurée, aucune recherche web). Historique :
l'implémentation initiale de #66 ciblait des flux ANACT/DARES/Légifrance —
tous bloqués par de l'anti-bot (ALTCHA/Cloudflare/F5), inutilisables par un
fetch serveur simple, d'où le remplacement temporaire par l'outil `web_search`
de Claude puis, ici, un retour au RSS avec une liste de sources revérifiée
(service-public.fr, legisocial.fr, bulletins-officiels.social.gouv.fr,
santepubliquefrance.fr).
