# Architecture du blog IA hebdomadaire

Vue d'ensemble du pipeline, du contenu Markdown à la publication automatique après
validation humaine. État d'avancement : **Phases 1-4 livrées** (voir issue #35) —
"Approuver" publie réellement l'article (greffe sur `master`), "Retoucher" relance
réellement Claude avec les retours et recommite le brouillon. Reste en dehors du
périmètre actuel : le plafond de 3 allers-retours de retouche évoqué dans le plan
initial n'est pas implémenté — chaque clic "Retoucher" relance Claude sans limite de
tentatives.

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
          │  répond type 7 puis    │   │  répond type 7 puis         │
          │  publie en async)      │   │  relance en async)          │
          └──────────┬─────────────┘   └──────────┬─────────────────┘
                     ▼                             ▼
          ┌─────────────────────┐   ┌─────────────────────────┐
          │ services/blog/         │   │ services/blog/             │
          │ publishDraft.ts        │   │ reviseDraft.ts             │
          │ (greffe les blobs sur  │   │ (Claude relit le brouillon │
          │  master, sans re-upload)│  │  + les retours → nouveau    │
          └──────────┬─────────────┘   │  commit sur la même branche)│
                     │                 └──────────┬─────────────────┘
                     ▼                             ▼
          push sur master (tag [blog-auto-deploy])           nouveau message Discord
          → .github/workflows/deploy.yml → build Docker      (Approuver / Retoucher)
          → GHCR → VPS/Traefik → site en ligne
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
| `app/api/discord/interactions/route.ts` | Vérifie la signature (401 sinon), répond immédiatement (type 7, boutons désactivés) puis termine la publication/retouche de façon asynchrone via `completeApproval`/`completeRevision` |
| `app/blog-review/[slug]/page.tsx` | Prévisualisation signée (`?token=`) du brouillon, allée chercher en direct sur `blog-draft/<slug>` via `githubBlogRepo.getDraftContent`, jamais depuis le disque (le conteneur ne contient pas `content/_drafts`) — `noindex`, image de couverture en data URI |

## Composants livrés (Phase 4, issue #35)

| Fichier | Rôle |
|---|---|
| `services/blog/discordInteractionHandler.ts` | Logique pure de routage des interactions (PING, boutons, modale) — répond type 7 immédiatement (boutons désactivés) pour éviter tout double clic pendant le travail asynchrone qui suit |
| `services/blog/publishDraft.ts` | Greffe les blobs déjà commités sur `blog-draft/<slug>` sur un nouveau commit `master` (pas de re-upload), avec garde-fous (`slug_mismatch`, `missing_cover_image`, `invalid_cover_path`) |
| `services/blog/reviseDraft.ts` | Relance Claude avec le brouillon existant + les retours de retouche, recommite sur la même branche `blog-draft/<slug>` (le slug ne change jamais d'une retouche à l'autre) et renotifie Discord |
| `services/blog/anthropicDraftGenerator.ts` (méthode `reviseDraft`) | Prompt caching Anthropic (`cache_control: {type: "ephemeral"}`) activé **uniquement** sur cet appel, jamais sur `parseDraft()` (cron hebdomadaire) |
| `services/blog/createBlogDraftDeps.ts` (`createReviseDraftDeps`) | Construit les dépendances réelles de la retouche, mêmes secrets que `createBlogDraftDeps()` |

**Pourquoi le prompt caching seulement sur `reviseDraft`** : le cron hebdomadaire
(`parseDraft()`) ne tourne qu'une fois par semaine — largement au-delà du TTL du cache
(5 min, 1h en étendu) donc toujours un cache miss, écriture payée pour rien. La boucle
de retouche, elle, relance Claude avec le **même prompt système** quelques minutes
après la génération initiale (l'humain clique "Retoucher" sur Discord juste après
avoir vu le brouillon), donc dans la fenêtre de cache : c'est le seul point du
pipeline où le caching a un effet réel.

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
- **La publication reste un simple `push` sur `master`**, mais un push "de
  développement" ordinaire (merge de PR, commit direct) ne déclenche plus le
  déploiement automatiquement — le déploiement final se fait désormais à la main
  (`workflow_dispatch`), pour garder la main sur le moment de la mise en ligne. Seule
  la publication d'un article approuvé reste bout-en-bout automatique côté humain :
  `publishDraft.ts` tague le message du commit avec `BLOG_AUTO_DEPLOY_TAG`
  (`[blog-auto-deploy]`), que le job `deploy` de `.github/workflows/deploy.yml`
  reconnaît via `contains(github.event.head_commit.message, ...)` pour se
  déclencher malgré tout — sans ce tag, cliquer "Approuver" sur Discord aurait
  publié l'article sur `master` sans jamais le mettre en ligne, contradiction avec
  l'attente d'un clic = article publié.
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
- **Réponse immédiate (type 7) plutôt que différée (type 6) sur "Approuver" et la
  soumission de la modale "Retoucher"** : la publication réelle (greffe Git Data API)
  et la retouche réelle (appel Claude + recommit + notification) dépassent souvent les
  ~3s accordés par Discord pour répondre à un clic. Un type 6 laisserait les boutons
  cliquables tout ce temps — double clic possible pendant un travail non-idempotent.
  Le type 7 désactive les boutons dès la réponse initiale ; le travail réel se termine
  ensuite de façon asynchrone dans le process Node du VPS puis met à jour le même
  message via `updateInteractionMessage()`.
- **Image de couverture en data URI sur la page de prévisualisation** : le brouillon
  n'est jamais sur le disque du conteneur (voir plus haut), donc pas d'URL statique
  `next/image` classique possible pour son illustration. Plutôt que d'ajouter une
  route dédiée au service du binaire, l'image (récupérée via Contents API) est
  encodée en base64 directement dans le HTML — un aperçu réservé à 1-2 personnes,
  pas une page à fort trafic, donc le coût d'une image non mise en cache est
  négligeable.

## Composants livrés (issue #67 — sujet Discord `/blog-sujet`)

| Fichier | Rôle |
|---|---|
| `scripts/registerDiscordCommand.ts` | Enregistre la commande slash `/blog-sujet` auprès de Discord (`PUT /applications/{id}/commands`) — appel manuel ponctuel, pas dans le runtime de l'app |
| `services/blog/discordInteractionHandler.ts` | Route l'invocation (ouvre une modale sujet/notes) et la soumission (`getBlogSujetSubmission`, `submitBlogSujet`) — réponse immédiate en **type 4** (pas de type 7 différé : écrire une entrée JSON via l'API Contents reste sous les ~3s accordés par Discord), sans aucune vérification d'identité (décision assumée) |
| `services/blog/githubBlogRepo.ts` (`queueDiscordTopic`/`getNextQueuedTopic`) | Lit/écrit `content/blog/sujets-discord.json` directement sur `master` (comme un fichier de contenu classique, pas de branche de brouillon) — file **partagée** avec la veille actualité (#66, voir ci-dessous) |
| `services/blog/generateDraft.ts` | Priorise la première entrée `"a_publier"` de la file sur la rotation pondérée de piliers (#52) quand elle existe ; le champ `pillar` reste obligatoire dans les deux cas |
| `scripts/registerDiscordCommand.ts` (commande `/blog-file`) / `services/blog/discordInteractionHandler.ts` (`getBlogFileRequest`, `listBlogFile`, `removeBlogFileEntry`) / `githubBlogRepo.ts` (`listQueuedTopics`, `removeQueuedTopic`) | Lister la file (`/blog-file`) ou en supprimer une entrée a posteriori (`/blog-file supprimer:<id>`), avant qu'elle ne soit consommée par `generateDraft()` — réponse **type 4** ephemeral (visible seulement par la personne qui tape la commande), même raisonnement de rapidité que `/blog-sujet` |

Cascade de priorité du sujet de la semaine, telle qu'implémentée aujourd'hui :
file d'attente unique (sujet Discord `/blog-sujet` **>** actualité approuvée,
voir #66 ci-dessous) **>** rotation pondérée de piliers (#52, seul niveau qui
s'applique toujours). Le statut d'une entrée (`"a_publier"` → `"publie"`) est
mis à jour **manuellement** après publication, pas de synchronisation
automatique — limite connue documentée plutôt que corrigée dans cette PR (une
file chargée peut faire remonter un sujet devenu entre-temps moins pertinent).

## Composants livrés (issue #66 — veille actualité, révisée : mix RSS + tri IA)

| Fichier | Rôle |
|---|---|
| `services/blog/rssFeedFetcher.ts` | Interroge un flux RSS/Atom (`fast-xml-parser`, timeout+abort) et le parse en `FeedItem[]` — tolérant : un flux hors service, mal formé, ou qui renvoie une page HTML (anti-bot) plutôt que du XML est traité comme "aucun article" plutôt que de faire échouer tout le scan |
| `services/blog/veilleSources.ts` (`parseVeilleSources`) | Parse `BLOG_VEILLE_SOURCES` (liste d'URLs séparées par des virgules) — sources pilotables sans déploiement de code |
| `services/blog/actualiteWatch.ts` (`filterRelevantItems`) | Pré-filtre mots-clés (QVCT, RPS, burn-out, TMS...), gratuit et déterministe, appliqué à tous les items agrégés avant le tri IA — les sources retenues sont généralistes/multi-thèmes, pas déjà filtrées par flux |
| `services/blog/actualiteWatch.ts` (`findActualite`) | 1 seul appel Claude (Haiku, sortie structurée, **aucun outil**) sur les items déjà filtrés : sélectionne jusqu'à 3 candidats, un par pilier, jamais déjà cités — remplace l'ancien mécanisme `web_search` (coûteux, boucle `pause_turn` à plafonner, résultats non ancrés à des sources vérifiées à l'avance). Défense contre une hallucination du modèle : un `sourceUrl`/`pillarId` qui ne correspond à aucun item réellement récupéré est silencieusement écarté |
| `services/blog/generateDraft.ts` (`proposeNextActualiteBestEffort`) | Effet de bord **non bloquant** à chaque appel de `generateDraft()` : notifie Discord de chaque candidat indépendamment (best-effort par candidat — l'échec de l'un n'empêche jamais les autres), sans jamais retarder ni remplacer la génération de la semaine |
| `services/blog/discordNotifier.ts` (`notifyActualiteProposal`) | Un message Discord distinct par candidat (jusqu'à 3), embed **minimal** (titre + lien) avec boutons "Approuver le sujet"/"Ignorer" propres à ce candidat (`custom_id` dérivé de son `sourceUrl`) |
| `services/blog/generateDraft.ts` (`queueApprovedActualite`) | Sur "Approuver" : récupère le texte intégral de la page source (best-effort, `services/blog/articleTextFetcher.ts`, repli sur le résumé RSS si le fetch échoue), puis ajoute l'actualité à la file partagée avec `/blog-sujet` (`queueActualiteTopic`) — **ne génère jamais rien directement** |

Historique : la première version (livrée initialement) faisait de la veille le
niveau le plus prioritaire de la cascade et **bloquait** la génération de la
semaine tant qu'une actualité candidate n'avait pas été explicitement décidée
sur Discord — en usage réel, un flux source correct mais peu pertinent
proposait un nouveau candidat à chaque exécution, sans jamais laisser la
génération hebdomadaire aboutir. Corrigé en découplant complètement la
proposition (effet de bord best-effort ci-dessus) de la génération (la veille
approuvée rejoint simplement la file comme un sujet Discord) — "Ignorer" ne
déclenche donc plus non plus aucune recherche de candidat suivant, juste un
accusé de réception immédiat.

Le mécanisme RSS/Atom d'origine (`BLOG_VEILLE_SOURCES`) avait ensuite été
abandonné au profit de l'outil `web_search` de Claude : les flux ANACT ciblés
à l'époque étaient protégés par une vérification anti-bot (ALTCHA),
inutilisables par un fetch serveur simple. Le mécanisme RSS lui-même
(parseur, tolérance aux pannes) n'était pas en cause — revérifié à la
révision de #66 ci-dessus : ANACT reste bloqué (retesté sur 5 flux
thématiques différents, avec cookies/Referer), tout comme DARES et
Légifrance (anti-bot Cloudflare/F5). D'autres sources officielles françaises
s'avèrent en revanche directement exploitables sans aucun contournement
(service-public.fr, legisocial.fr, bulletins-officiels.social.gouv.fr,
santepubliquefrance.fr — ce dernier exposant même des flux filtrés par région,
dont Occitanie) — voir `docs/blog-secrets.md` et `.env.example` pour la liste
vérifiée. Le retour au RSS remplace `web_search` par un pré-filtre mots-clés
gratuit suivi d'un unique appel de tri (Haiku, sans outil), moins coûteux et
sans le risque de boucle `pause_turn` de l'ancien mécanisme.

Voir aussi `docs/blog-secrets.md` (secrets requis), `docs/blog-charte-editoriale.md`
(voix/contraintes du prompt système) et `docs/blog-guide-validation-discord.md`
(usage prévu pour la validation).

## Composants livrés (issue #73 — cocons sémantiques)

| Fichier | Rôle |
|---|---|
| `lib/blog.ts` (`frontmatterSchema`, `getRelatedPosts`) | Expose le champ `pillar` (déjà imposé côté génération par `BlogDraftSchema`, désormais lu/validé aussi côté frontmatter publié, `null` par défaut pour un article publié avant cette issue) et calcule les autres articles publiés du même pilier |
| `app/blog/[slug]/page.tsx` | Affiche, en bas de chaque article, les liens vers les autres articles du même cocon (pilier) quand il y en a |

Les 4 piliers de rotation pondérée (#52, `services/blog/pillars.ts`) sont
réutilisés tels quels comme cocons sémantiques plutôt que d'introduire une
notion de regroupement distincte des tags — voir le détail (mapping pilier ↔
cocon) dans `docs/blog-charte-editoriale.md`. Un article publié avant cette
issue n'a pas de `pillar` déclaré (`null` par défaut, rétrocompatible) et
n'affiche donc aucun lien de cocon tant qu'il n'en reçoit pas un.

## Composants livrés (issue #72 — maillage retour service → blog)

| Fichier | Rôle |
|---|---|
| `lib/blog.ts` (champ `pillar`) | Le frontmatter publié conserve désormais le pilier déclaré à la génération (`services/blog/generateDraft.ts::buildDraftMarkdown` l'écrivait déjà, mais `frontmatterSchema` l'ignorait silencieusement — zod ne garde que les clés déclarées) |
| `lib/relatedArticles.ts` (`getRelatedArticleLinks`) | Pour une page de service donnée, retrouve les articles publiés dont le pilier cible cette page (`services/blog/pillars.ts::PILLARS`), triés du plus récent au plus ancien et plafonnés à 3 ; renvoie `[]` tant que `BLOG_ENABLED` n'est pas `"true"` (sinon lien mort vers `/blog/[slug]`, qui 404) |
| `components/ArticlesBlogLiesBloc.tsx` | Rendu partagé par les 4 pages de service (`liens={...}` sur `ArticulationBloc`) — ne rend rien si aucun article ne cible encore la page |

Le lien retour (service → article) est donc automatique et n'a **aucune étape
manuelle par publication** : chaque brouillon déclare déjà obligatoirement son
pilier (`services/blog/draftSchema.ts`), qui pointe déjà vers une page de
service (`targetPage`, utilisé jusqu'ici uniquement pour le lien
article → service demandé au modèle). Publier un article suffit à le faire
apparaître, au prochain build, sur la page de service correspondante — sans
nouvelle association à maintenir en parallèle du frontmatter existant.
