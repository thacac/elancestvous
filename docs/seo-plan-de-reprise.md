# Plan de reprise SEO — état des lieux et priorités

Consolide deux travaux menés en parallèle sur des branches différentes :
- l'audit/correctif technique de cette branche (`feat/seo-improvements`,
  commit `3cce683`) ;
- l'audit éditorial et le plan de contenu blog de la
  [PR #43](https://github.com/thacac/elancestvous/pull/43)
  (`docs/seo-audit-pages-existantes.md`, `docs/blog-plan-editorial.md`),
  encore ouverte et empilée sur la chaîne `#29 → #36 → #37 → #43`.

Aucun outil d'audit automatisé (`claude-seo`) n'a encore tourné sur ce dépôt —
tout ce qui suit vient de deux lectures manuelles du code, convergentes sur
les mêmes constats.

## 1. Déjà fait (sur `feat/seo-improvements`, pas encore en PR)

Commit `3cce683` — corrige des problèmes techniques bloquants :

- **Host canonique unifié** : `metadataBase`, canonicals et `og:url`
  pointaient vers `www.elancestvous.fr`, qui n'a pas d'enregistrement DNS
  (host mort). Tout bascule sur `https://elancestvous.fr`.
- **2 `og:url` cassées** (404) sur `formations-rps-qvct` et la page GAPP,
  corrigées.
- **JSON-LD jamais monté** : le composant `<JsonLd />` existait mais
  n'était appelé nulle part dans `app/layout.tsx` — donc invisible pour
  Google. Réécrit en `@graph` (`WebSite` + `Person` + `ProfessionalService`
  liés par `@id`), ajout `sameAs` LinkedIn, `knowsAbout`, `priceRange`,
  `areaServed`, `OfferCatalog`.
- Titres de pages de service : suppression du suffixe dupliqué
  "| Élan C'est Vous".
- Sitemap : retrait de `/mentions-legales` (noindex) de la liste indexable.
- Alt text amélioré (logo Hero, photo Coralie).

**Action immédiate : ouvrir une PR pour cette branche.** C'est le correctif
le plus impactant et le plus urgent (host canonique mort + JSON-LD jamais
servi), et il n'est protégé par aucune review pour l'instant.

## 2. Constats de l'audit on-page, pas encore corrigés (PR #43)

Par ordre de priorité, vérifié aussi depuis cette session (grep sur les
pages de service : aucun lien croisé, aucun composant Breadcrumb dans le
repo) :

| # | Constat | Priorité | Effort |
|---|---|---|---|
| 1 | **Maillage interne quasi nul entre pages commerciales** : aucune des 4 pages de service ni `à-propos` ne lie vers une autre (seulement vers `/contact`). L'accueil est correct (`Axes.tsx`, `Hero.tsx`), mais un visiteur arrivé sur une page de service n'a aucun chemin vers les offres connexes. | **Haute** | Faible — additif, JSX + `next/link` |
| 2 | Contenu court sur les 4 pages de service (~287-410 mots) | Moyenne | À traiter via le blog plutôt qu'en gonflant le texte |
| 3 | Aucune illustration sur les 4 pages de service | Basse | Une image + alt par page |
| 4 | Pas de `BreadcrumbList` malgré une hiérarchie d'URL à 2 niveaux | Basse/Moyenne | Un composant réutilisable |

Ce qui est déjà solide et à ne pas casser en touchant ces pages : metadata
complète sur les 7 pages, un seul `<h1>`/page, `next/image` partout,
`/mentions-legales` correctement en noindex.

## 3. Volet contenu (blog) — PRs ouvertes, non mergées

Chaîne empilée, dans l'ordre de dépendance :

- **PR #29** — pipeline de contenu Markdown (sans IA), base `master`.
- **PR #36** — génération hebdomadaire IA en zone de relecture, base #29.
- **PR #37** — doc roadmap (architecture, secrets, charte éditoriale, guide
  Discord), base #36.
- **PR #43** — plan éditorial 12 semaines + audit pages existantes, base #37.

Le plan éditorial (`docs/blog-plan-editorial.md`) mappe 12 semaines
d'articles à un mot-clé, une intention de recherche et **une page de
service cible pour le maillage interne** (piliers coaching individuel /
coaching établissement / QVCT-RPS / GAPP + un axe SEO local
Toulouse/Occitanie). Le premier article visé est daté du 08/09/2026.

**Risque identifié : chaîne de 4 PRs empilées, aucune mergée.** Plus elle
s'allonge, plus les conflits de rebase deviennent coûteux et plus le
calendrier du plan éditorial (dates déjà fixées) risque de glisser sans que
personne ne s'en aperçoive avant la publication.

## 4. Séquencement recommandé

1. **Ouvrir et merger la PR technique de `feat/seo-improvements`** — corrige
   un host canonique mort et des données structurées invisibles, sans
   dépendance sur autre chose.
2. **Merger la chaîne blog dans l'ordre #29 → #36 → #37 → #43**, ou a minima
   valider et merger #29+#36 rapidement pour éviter que la chaîne continue
   de s'allonger avant que rien ne soit en `master`.
3. **Traiter le finding #1 de l'audit (maillage interne) en PR dédiée,
   indépendante du blog** : ajouter un bloc "Voir aussi" sur les 3 pages
   `professionnels-etablissements-de-soins/*` (liens croisés) et un lien
   contextuel dans `app/a-propos/page.tsx`. Correctif additif, sans risque
   de régression, à faire sans attendre le blog.
4. **Une fois le blog en ligne** (`NEXT_PUBLIC_BLOG_ENABLED`) et le premier
   article publié : implémenter le mécanisme décrit en section 4 de
   `docs/blog-plan-editorial.md` (fichier `content/blog/sujets-prioritaires.json`
   consommé par `generateDraft.ts`, avec TDD) pour que la génération
   hebdomadaire suive réellement le calendrier de mots-clés plutôt que de
   proposer des sujets libres.
5. **Finding #3 (images) et #4 (breadcrumbs)** : à planifier après le
   maillage interne, priorité basse — ne bloquent rien d'autre.
6. **Installer et exécuter `claude-seo`** (github.com/AgriciDaniel/claude-seo,
   mentionné dans les deux audits comme non encore fait) pour croiser ces
   constats manuels avec un audit outillé : indexation réelle, performance,
   éventuelles balises manquantes non détectées ici.
7. **Après quelques semaines de publication** : croiser le calendrier de
   mots-clés avec Search Console (impressions/clics réels) pour valider ou
   réordonner les priorités du plan éditorial — un mot-clé sans impression
   après 2-3 mois doit être remplacé par une entrée du backlog déjà listée
   dans `docs/blog-plan-editorial.md`.

## 5. Ce qui ne doit pas être cassé au passage

- Host canonique unique `elancestvous.fr` (non-www) — ne pas réintroduire
  `www.` nulle part.
- `<JsonLd />` doit rester monté dans `app/layout.tsx`.
- `/mentions-legales` doit rester hors sitemap et en noindex.
- Un seul `<h1>` par page, `next/image` partout : contraintes à respecter
  dans tout ajout de contenu ou d'image sur les pages de service.
