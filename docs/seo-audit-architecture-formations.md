# Audit SEO — architecture du catalogue de formations (Val)

Reprise de `docs/seo-plan-de-reprise.md` (section « Séquencement recommandé »,
points 5 et 6, jamais terminés) et de `docs/seo-audit-pages-existantes.md` :
cette fois centrée sur l'architecture `/formations` telle qu'elle existe
aujourd'hui, après les chantiers de rattrapage design et le câblage de la
provenance du formulaire de contact (PR #119 à #128). Cette partie du site
a beaucoup grandi depuis le dernier audit (catalogue, 4 hubs famille, fiches
individuelles, maillage retour blog) et n'avait jamais été reparcourue avec
un œil SEO depuis.

## Méthodologie

- Code audité : branche `validation` (état exact déployé sur la Val), au
  commit `88584c6`.
- **La Val elle-même n'a pas pu être requêtée directement** : elle est
  protégée par Basic Auth (Traefik, voir `DEPLOYMENT.md`) et je n'ai pas ces
  identifiants dans cette session. Les vérifications empiriques ci-dessous
  viennent donc d'un serveur `yarn dev` local sur le même commit — le HTML
  rendu est identique à celui de la Val (même code, mêmes données de
  contenu), seule l'adresse diffère. Pas d'accès au plugin `claude-seo`
  dans cette session non plus (voir la note de `seo-plan-de-reprise.md` sur
  son incompatibilité avec le proxy réseau de ce type d'environnement, de
  toute façon) — tout ce qui suit est vérifié par lecture de code et par
  `curl` sur le rendu HTML réel, pas des suppositions.
- Rappel : la Val est volontairement `noindex`/`disallow: /` et derrière
  Basic Auth (`lib/featureFlags.ts`, `isValidationEnv()`) — cet audit ne
  porte donc pas sur l'indexation de la Val elle-même (qui ne doit jamais
  être indexée), mais sur l'**architecture SEO qui partira en production**
  telle quelle à la prochaine promotion `validation` → `master`.

## Ce qui est déjà solide (ne pas casser)

- **Maillage interne désormais dense sur tout le catalogue** : accueil →
  3 piliers (`Axes.tsx`) → `/formations` → 4 tuiles famille → hub famille →
  fiches publiées, plus le lien retour "Retour au catalogue des formations"
  sur chaque fiche. L'ancien finding #1 de `seo-audit-pages-existantes.md`
  ("maillage interne quasi inexistant") est résolu sur ce périmètre.
- **`BreadcrumbList` JSON-LD désormais en place** (`components/Breadcrumbs.tsx`,
  vérifié sur une fiche réelle : 3 `ListItem` — Accueil / Famille / Titre).
  L'ancien finding #4 ("pas de données structurées BreadcrumbList") est
  résolu.
- **Les 4 hubs famille ont une metadata complète et correcte** : `title`,
  `description`, `alternates.canonical` self-référent, `openGraph` dédié —
  vérifié par lecture de code sur les 4 (`cadre-legal...`, `prevention-rps-qvct...`,
  `accompagnement-professionnel...`, `dynamique-equipe...`) et confirmé par
  `curl` sur un des quatre.
- **Un seul `<h1>` par page**, y compris sur le catalogue et les fiches
  (vérifié par `curl` + comptage).
- **Headers de sécurité HTTP** (`next.config.ts`) toujours en place —
  non régressés depuis le dernier audit.
- **Host canonique unique** `elancestvous.fr`, `<JsonLd />` toujours monté
  dans `app/layout.tsx` — non régressés.

## Findings, par priorité

### 1. [Critique] `/formations` et toutes les fiches individuelles n'ont aucune metadata propre — canonical, titre et description faux

Ni `app/formations/page.tsx` (catalogue), ni
`app/formations/[famille]/[slug]/page.tsx` (fiche — route dynamique, donc
**toutes** les fiches présentes et futures) ne déclarent de `metadata` ou
`generateMetadata`. Ces pages héritent donc intégralement de la metadata du
layout racine (`app/layout.tsx`), qui déclare
`alternates: { canonical: "/" }` sans template de substitution pour le titre.

Vérifié par `curl` sur le rendu réel (3 URLs testées, toutes identiques à
la page d'accueil) :

| URL | `<title>` | `rel="canonical"` |
| --- | --- | --- |
| `/formations` | *(générique, identique à l'accueil)* | `https://elancestvous.fr` |
| `/formations/cadre-legal-etablissements-sante/obligations-legales-des-etablissements` | *(générique, identique à l'accueil)* | `https://elancestvous.fr` |
| `/formations/prevention-rps-qvct-etablissements-sante/diagnostic-plan-action-qvct` | *(générique, identique à l'accueil)* | `https://elancestvous.fr` |

`og:title`, `og:description` et `og:url` sont pareillement faux (confirmé
sur la fiche obligations-légales — `og:url` vaut la page d'accueil).

**Pourquoi c'est critique, pas juste cosmétique** : un `rel="canonical"`
pointant vers la page d'accueil dit explicitement à Google "cette page est
un doublon de la page d'accueil, indexe l'accueil à sa place" — c'est le
signal technique le plus direct qui existe pour **empêcher** l'indexation
d'une page sous sa propre URL. Les 2 fiches déjà publiées (du vrai contenu
commercial, ciblé, avec du texte unique) risquent concrètement de ne
jamais apparaître dans les résultats de recherche sous leur propre URL tant
que ce n'est pas corrigé — et ce sera vrai de toute future fiche ajoutée
sans y penser, puisque c'est un défaut de la route dynamique elle-même, pas
d'un contenu particulier.

**Recommandation** : ajouter `generateMetadata` sur
`app/formations/[famille]/[slug]/page.tsx` (titre = `formationDetail.titre`,
description dérivée du premier paragraphe du corps markdown ou d'un extrait
des objectifs pédagogiques, canonical self-référent sur l'URL réelle,
`openGraph` dédié) et `export const metadata` statique sur
`app/formations/page.tsx` (catalogue), sur le modèle déjà appliqué aux 4
hubs famille. Risque de régression très faible (ajout pur), mais à vérifier
avec un test (titre/canonical attendus) comme pour le reste du site.

### 2. [Critique, lié au #1] Le sitemap n'inclut ni les fiches individuelles ni 3 des 4 hubs famille

`app/sitemap.ts` liste `/formations` et **un seul** des 4 hubs
(`prevention-rps-qvct-etablissements-sante` — probablement ajouté quand
c'était encore le seul hub qui existait). Manquent :

- 3 hubs famille : `cadre-legal-etablissements-sante`,
  `accompagnement-professionnel-etablissements-sante`,
  `dynamique-equipe-etablissements-sante`.
- **Les 2 fiches individuelles publiées**, et toute future fiche —
  contrairement au blog (`getAllPostsMeta()` déjà mappé dynamiquement dans
  `sitemap.ts`), rien n'appelle `getAllFormationsMeta()` pour générer les
  entrées de sitemap des fiches.

Ces pages restent indexables en théorie (pas de `noindex`, maillage interne
présent), mais sans entrée de sitemap elles dépendent entièrement de la
découverte par crawl — plus lent, moins prioritaire aux yeux de Google, et
sans le signal `lastModified` que le sitemap donne pour le reste du site.
Combiné au finding #1, c'est une double absence de signal : pas de
canonical correct *et* pas de sitemap — le pire des deux mondes pour ces
pages.

**Recommandation** : étendre `app/sitemap.ts` sur le modèle déjà utilisé
pour le blog — mapper `FORMATION_FAMILLES` (4 hubs) et
`getAllFormationsMeta()` (toutes les fiches, présentes et futures) en
entrées de sitemap, comme c'est déjà fait pour `getAllPostsMeta()`. Garde
le sitemap automatiquement à jour à chaque nouvelle fiche publiée, sans
intervention manuelle.

### 3. [Haute] Le JSON-LD `OfferCatalog` global est obsolète depuis l'ajout des 3 autres familles

`components/JsonLd.tsx` (`hasOfferCatalog.itemListElement`) ne référence
que 4 offres génériques : coaching particuliers, coaching établissements,
« Formations QVCT / RPS » (un seul des 4 hubs, par son URL), et GAPP — écrit
à l'époque où ce hub était la seule famille de formations existante.
Manquent les 3 autres familles, le catalogue `/formations` lui-même, et
tout schema de type `Course` pour les fiches individuelles (le type
schema.org le plus adapté à ce contenu, pris en charge par les résultats
enrichis "Formations" de Google).

**Recommandation** (priorité haute mais effort plus conséquent que #1/#2,
à traiter après) :
- Compléter `hasOfferCatalog` avec les 3 familles manquantes (correctif
  rapide, même registre que l'existant).
- Évaluer séparément l'ajout d'un schema `Course` par fiche (sur le modèle
  des champs déjà présents dans `lib/formations.ts` — `duree`, `format`,
  `prerequis`, `publicVise` correspondent bien aux propriétés attendues par
  `Course`/`CourseInstance`) — plus structurant, à cadrer dans une story
  dédiée plutôt qu'en correctif rapide.

### 4. [Reprise, résolu] Findings #2 et #3 de l'ancien audit — revérifiés, plus d'actualité

Revérifiés après coup (hors scope "architecture" au moment de la rédaction
initiale de ce document, mais la question méritait une réponse avant de
rester en suspens) : les deux sont **déjà résolus**, en effet de bord des
chantiers de rattrapage design (Chantiers A/B/C) menés sur ces pages depuis
le dernier audit — sans lien avec le présent audit architecture.

Comptage du texte visible (hors JSX/attributs, même méthode que l'ancien
audit) sur les 4 pages concernées :

| Page | Ancien audit | Aujourd'hui |
| --- | --- | --- |
| `/coaching/particuliers` | ~366 mots | ~423 mots |
| `/coaching/etablissements` | ~410 mots | ~470 mots |
| `/gapp-analyse-pratiques-professionnelles` | ~322 mots | ~377 mots |
| `/formations/prevention-rps-qvct-etablissements-sante` | ~287 mots | ~425 mots |

- **Ancien finding #2 (contenu court) : résolu.** Le contenu a grandi de
  +15 à +48 % selon la page, via les blocs ajoutés depuis
  (`CartesContrastBloc`, `BadgesBloc`, le bloc "Modalités pratiques",
  `PublicsCiblesBloc`, `ArticulationBloc`).
- **Ancien finding #3 (aucune illustration) : résolu.** Les 3 pages de
  coaching/GAPP ont désormais chacune une photo réelle (`Citation`,
  `imageSrc="/coralie.png"`) plus des icônes SVG illustratives (fond
  décoratif + icônes des cartes "Public visé"). Seule nuance : c'est la
  même photo de Coralie réutilisée sur les 3 pages, pas une illustration
  dédiée par page — un choix de charte cohérent, pas un manque. Le hub
  `prevention-rps-qvct` n'a pas de photo `Citation` mais a les mêmes icônes
  décoratives que les 3 autres hubs famille (déjà noté solide plus haut).

Rien à corriger ici — aucune PR de suivi nécessaire pour ce point.

## Séquencement recommandé

1. ~~**Finding #1 (metadata manquante)**~~ — corrigé, PR #130.
2. ~~**Finding #2 (sitemap)**~~ — corrigé, PR #131.
3. ~~**Finding #3 (OfferCatalog)**~~ — corrigé, PR #132 (le schema `Course`
   par fiche individuelle reste hors scope, à cadrer dans une story dédiée).
4. ~~**Finding #4**~~ — revérifié, résolu (voir section correspondante),
   aucune PR de suivi nécessaire.

Les 4 findings de cet audit sont clos.

## Ce qui ne doit pas être cassé au passage

- Host canonique unique `elancestvous.fr` (non-www).
- `/mentions-legales` hors sitemap et `noindex`.
- La Val reste `noindex`/`disallow: /` et derrière Basic Auth — ne jamais
  toucher à `isValidationEnv()` dans ce sens.
- Un seul `<h1>` par page, `next/image` partout.
