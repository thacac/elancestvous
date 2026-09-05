# Architecture du blog IA hebdomadaire

Vue d'ensemble du pipeline, du contenu Markdown à la publication automatique après
validation humaine. État d'avancement : **Phases 1-3 livrées** (PR #29, #36, et
celle-ci), **Phase 4 pas commencée** (publication/relance réelles, voir issue #35).

## Verrou de lancement public

Le blog reste invisible tant que `BLOG_ENABLED` n'est pas explicitement `"true"`
(voir `lib/featureFlags.ts`) : `/blog` et `/blog/[slug]` renvoient 404, aucun lien
dans la navbar, rien dans le sitemap. Ce verrou est volontairement indépendant du
reste du pipeline : la génération IA hebdomadaire (Phase 2) continue de tourner et
de committer ses brouillons sur des branches `blog-draft/<slug>` privées, jamais
exposées, que le blog soit public ou non. Activer le lancement se fait en une seule
variable (`BLOG_ENABLED=true` en secret GitHub), le jour où le contenu et
l'illustration sont jugés prêts.

Cette variable est volontairement **server-only**, sans préfixe `NEXT_PUBLIC_` :
`app/layout.tsx` calcule `isBlogPublic()` côté serveur et transmet un booléen en
prop au composant client `Navbar`, plutôt que de laisser ce dernier lire la
variable d'environnement dans son propre bundle. Conséquence pratique : `/blog`,
`/blog/[slug]`, `robots.txt` et `sitemap.xml` sont tous pré-rendus statiquement au
`next build` (vérifié par un build manuel dans les deux états) — changer ce flag
nécessite donc un nouveau build/déploiement (ex. `workflow_dispatch` sur
`deploy.yml`), pas seulement un redémarrage du conteneur avec un `.env` modifié.

**SEO pendant que c'est désactivé** : le 404 (`notFound()`) empêche déjà
l'indexation et ne fuit pas les métadonnées de la page (vérifié : le `<title>`
retombe sur celui du layout racine). `app/robots.ts` ajoute en plus un
`disallow: /blog` explicite tant que `isBlogPublic()` est faux — pour éviter que
les robots crawlent la page pour rien plutôt que de compter uniquement sur le 404.
Ce disallow disparaît automatiquement dès que `BLOG_ENABLED=true` (jamais
l'inverse, pour ne pas reproduire le classique "disallow oublié après le
lancement" qui empêcherait l'indexation une fois le blog réellement public).

## Schéma du flux

```
┌─────────────┐   cron hebdo    ┌──────────────────────┐
│ GitHub       │ ───POST──────► │ /api/blog/generate     │
│ Actions      │  (Bearer       │ (app Next.js sur le VPS)│
│ (blog-weekly-│   BLOG_CRON_   └──────────┬─────────────┘
│  trigger.yml)│   SECRET)                 │
└─────────────┘                            ▼
                                  ┌──────────────────────┐
                                  │ services/blog/         │
                                  │ generateDraft.ts       │
                                  └──────────┬─────────────┘
                     ┌────────────────────────┼────────────────────────┐
                     ▼                        ▼                        ▼
          ┌─────────────────┐     ┌─────────────────────┐   ┌─────────────────────┐
          │ Claude           │     │ OpenAI gpt-image-1    │   │ GitHub Contents API   │
          │ (texte structuré,│     │ (illustration de       │   │ (liste des titres déjà│
          │  zod-validé)     │     │  couverture)           │   │  publiés, anti-doublon)│
          └────────┬─────────┘     └──────────┬──────────┘   └─────────────────────┘
                    └──────────────┬───────────┘
                                   ▼
                     ┌───────────────────────────────┐
                     │ GitHub Contents API               │
                     │ commit sur blog-draft/<slug>     │
                     │ (content/_drafts/<slug>/post.md  │
                     │  + cover.jpg — Git Data API       │
                     │  réservée à la branche)           │
                     └───────────────┬───────────────────┘
                                     ▼
                     ┌───────────────────────────────┐
                     │ Discord — message avec aperçu    │
                     │ + boutons Approuver / Retoucher  │
                     │ (services/blog/discordNotifier)  │
                     └───────────────┬───────────────────┘
                        Approuver ▼      ▼ Retoucher
          ┌─────────────────────┐   ┌─────────────────────────┐
          │ app/api/discord/       │   │ app/api/discord/           │
          │ interactions/route.ts  │   │ interactions/route.ts      │
          │ (vérifie la signature, │   │ (ouvre une modale, puis     │
          │  journalise — Phase 3) │   │  journalise le retour —    │
          └──────────┬─────────────┘   │  Phase 3)                  │
                     │                 └──────────┬─────────────────┘
                     │  Phase 4 (à venir)          │  Phase 4 (à venir)
                     ▼                             ▼
          ┌─────────────────────┐   ┌─────────────────────────┐
          │ services/blog/         │   │ Claude relit le brouillon │
          │ publishDraft.ts        │   │ + les retours → nouvelle   │
          │ (greffe les blobs sur  │   │ proposition (boucle,       │
          │  master, sans re-upload)│  │  plafond 3 allers-retours) │
          └──────────┬─────────────┘   └─────────────────────────┘
                     ▼
          push sur master → .github/workflows/deploy.yml
          (inchangé) → build Docker → GHCR → VPS/Traefik → site en ligne
```

## Composants livrés (Phases 1-2)

| Fichier | Rôle |
|---|---|
| `lib/blog.ts` | Lecture/validation (zod) de `content/blog/*.md`, rendu Markdown → HTML sanitisé (remark/rehype + isomorphic-dompurify) |
| `app/blog/page.tsx`, `app/blog/[slug]/page.tsx` | Liste et détail des articles publiés |
| `components/PostJsonLd.tsx` | Schema.org `BlogPosting` par article |
| `services/blog/draftSchema.ts` | Schéma zod partagé du brouillon structuré (titre, slug, description, extrait, tags, corps Markdown, prompts d'image) |
| `services/blog/generateDraft.ts` | Orchestrateur (injection de dépendances, testable sans réseau) |
| `services/blog/anthropicDraftGenerator.ts` | Appel Claude (`client.messages.parse` + sortie structurée zod) |
| `services/blog/openaiImageGenerator.ts` | Appel OpenAI `gpt-image-1` pour l'illustration |
| `services/blog/githubBlogRepo.ts` | Liste des titres publiés + commit du brouillon via l'API Contents GitHub (Git Data API réservée à la création de la branche) |
| `services/blog/createBlogDraftDeps.ts` | Construit les dépendances réelles à partir des variables d'environnement |
| `app/api/blog/generate/route.ts` | Point d'entrée protégé par `BLOG_CRON_SECRET` |
| `.github/workflows/blog-weekly-trigger.yml` | Cron hebdomadaire (réveille la route, aucune logique métier dans le workflow) |

## Composants livrés (Phase 3)

| Fichier | Rôle |
|---|---|
| `lib/discordSignature.ts` | Vérifie la signature Ed25519 d'une requête Discord (`tweetnacl`) — protection centrale de la route d'interactions |
| `lib/reviewToken.ts` | Jeton HMAC-SHA256 protégeant les liens de prévisualisation |
| `services/blog/discordNotifier.ts` | Poste le message hebdomadaire (embed + image de couverture en pièce jointe + boutons Approuver/Retoucher) |
| `services/blog/discordInteractionHandler.ts` | Logique pure de routage des interactions (PING, boutons, modale) — journalise la décision, ne publie/ne relance rien encore (Phase 4) |
| `app/api/discord/interactions/route.ts` | Vérifie la signature (401 sinon) puis délègue à `discordInteractionHandler` |
| `app/blog-review/[slug]/page.tsx` | Prévisualisation signée (`?token=`) du brouillon, allée chercher en direct sur `blog-draft/<slug>` via `githubBlogRepo.getDraftContent`, jamais depuis le disque (le conteneur ne contient pas `content/_drafts`) — `noindex`, image de couverture en data URI |

## Composants à venir (Phase 4, issue #35)

| Fichier | Rôle |
|---|---|
| `services/blog/publishDraft.ts` | Greffe les blobs déjà commités sur `blog-draft/<slug>` sur un nouveau commit `master` (pas de re-upload) |
| `services/blog/reviseDraft.ts` | Relance Claude avec le brouillon + les retours de retouche |

**`reviseDraft.ts` : activer le prompt caching Anthropic sur `SYSTEM_PROMPT`** (bloc
`system` en `cache_control: { type: "ephemeral" }` dans `anthropicDraftGenerator.ts`).
Contrairement à la génération hebdomadaire (`generateDraft.ts`), inutile là-bas car le
cron ne tourne qu'une fois par semaine — largement au-delà du TTL du cache (5 min, 1h
en étendu) donc toujours un cache miss, écriture payée pour rien — la boucle de
retouche relance Claude avec le **même prompt système** quelques minutes après la
génération initiale (l'humain clique "Retoucher" sur Discord juste après avoir vu le
brouillon), donc dans la fenêtre de cache : c'est le seul point du pipeline où le
caching a un effet réel.

## Pourquoi cette architecture (rappel des choix)

- **Markdown pur, pas MDX** : le contenu est généré par une IA sans revue ligne à
  ligne avant d'atteindre `content/_drafts/` — du MDX transformerait ce texte en JSX
  exécuté côté serveur. Le Markdown reste une donnée inerte, assainie par
  `rehype-sanitize` + `isomorphic-dompurify`.
- **Tout vit dans l'app Next.js déjà en ligne, pas dans des scripts Actions séparés** :
  le conteneur de production tourne en continu sur le VPS ; c'est lui qui doit pouvoir
  répondre à un clic Discord à n'importe quel moment de la semaine, pas seulement
  pendant un run GitHub Actions.
- **GitHub comme seul stockage durable avant publication** : le conteneur Docker en
  production ne contient que `.next/standalone` et `public/` (voir `Dockerfile`) — pas
  `content/`. Tout ce qui n'est pas encore sur `master` doit vivre sur une branche
  GitHub, jamais sur le disque du conteneur.
- **La publication reste un simple `push` sur `master`** : `.github/workflows/deploy.yml`
  n'a besoin d'aucune modification — il se déclenche exactement comme pour un commit
  humain.
- **Contents API plutôt que Git Data API pour committer un brouillon** : un article +
  une image à la fois ne justifie pas la plomberie blob/tree/commit — deux appels
  `createOrUpdateFileContents` suffisent. Contrepartie acceptée : deux commits
  séquentiels sur la branche de brouillon plutôt qu'un seul commit atomique, sans
  conséquence pour une branche jetable.
- **Images compressées en JPEG à la source** : les illustrations sont committées dans
  le dépôt git et y restent pour toujours, même remplacées plus tard — l'historique
  git ne s'allège jamais tout seul. `gpt-image-1` est donc appelé avec
  `output_format: "jpeg"` + compression, ce qui borne chaque image à ~100-150 Ko au
  lieu des plusieurs Mo d'un PNG par défaut. À ce rythme (un article/semaine), la
  croissance du dépôt reste de l'ordre de quelques Mo par an. Si le blog devait un
  jour publier beaucoup plus souvent ou en plus haute résolution, Git LFS serait la
  suite logique — pas nécessaire à ce stade.
- **Phase 3 journalise, ne publie/ne relance rien** : `discordInteractionHandler.ts`
  répond à "Approuver" et à la soumission de la modale "Retoucher" en mettant
  simplement à jour le message Discord — aucun push sur `master`, aucun appel à
  Claude. Objectif : valider la vérification de signature et l'UX (mobile compris)
  en conditions réelles avant de brancher des actions irréversibles (Phase 4).
- **Image de couverture en data URI sur la page de prévisualisation** : le brouillon
  n'est jamais sur le disque du conteneur (voir plus haut), donc pas d'URL statique
  `next/image` classique possible pour son illustration. Plutôt que d'ajouter une
  route dédiée au service du binaire, l'image (récupérée via Contents API) est
  encodée en base64 directement dans le HTML — un aperçu réservé à 1-2 personnes,
  pas une page à fort trafic, donc le coût d'une image non mise en cache est
  négligeable.

Voir aussi `docs/blog-secrets.md` (secrets requis), `docs/blog-charte-editoriale.md`
(voix/contraintes du prompt système) et `docs/blog-guide-validation-discord.md`
(usage prévu pour la validation).
