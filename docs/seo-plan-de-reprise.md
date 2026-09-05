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

## 1. Déjà fait — mergé sur `master`

Commit `94d6c1d` sur `master` (identique à `3cce683` sur cette branche,
confirmé par `git diff` vide entre les deux — même correctif, poussé
directement sur `master` sans passer par une PR de cette branche) — corrige
des problèmes techniques bloquants :

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

Rien à faire ici : déjà en production. `feat/seo-improvements` a été
remise à jour avec `master` (merge sans conflit) le temps de vérifier.

## 2. Constats de l'audit on-page, pas encore corrigés (PR #43)

Par ordre de priorité, vérifié aussi depuis cette session (grep sur les
pages de service : aucun lien croisé, aucun composant Breadcrumb dans le
repo) :

| # | Constat | Priorité | Effort | Statut |
|---|---|---|---|---|
| 1 | **Maillage interne quasi nul entre pages commerciales** : aucune des 4 pages de service ni `à-propos` ne lie vers une autre (seulement vers `/contact`). L'accueil est correct (`Axes.tsx`, `Hero.tsx`), mais un visiteur arrivé sur une page de service n'a aucun chemin vers les offres connexes. | **Haute** | Faible — additif, JSX + `next/link` | ✅ Corrigé sur cette branche (voir 2 bis) |
| 2 | Contenu court sur les 4 pages de service (~287-410 mots) | Moyenne | À traiter via le blog plutôt qu'en gonflant le texte | À faire |
| 3 | Aucune illustration sur les 4 pages de service | Basse | Une image + alt par page | À faire |
| 4 | Pas de `BreadcrumbList` malgré une hiérarchie d'URL à 2 niveaux | Basse/Moyenne | Un composant réutilisable | À faire |

Ce qui est déjà solide et à ne pas casser en touchant ces pages : metadata
complète sur les 7 pages, un seul `<h1>`/page, `next/image` partout,
`/mentions-legales` correctement en noindex.

## 2 bis. Finding #1 corrigé, en TDD — et un bug bien plus grave trouvé en creusant

En traitant le maillage interne (section 4, point 3), la question de
l'obfuscation volontaire des liens du footer nous a fait relire
`Footer.tsx` et `Navbar.tsx`. Les liens de `ArticulationBloc` étaient déjà
purement textuels ("... en articulation avec des groupes d'analyse de la
pratique") sans jamais de vrai lien — corrigé en ajoutant un prop `liens`
au composant.

**Découverte plus sérieuse : `Navbar.tsx` et `Footer.tsx` rendaient toute
la navigation du site en vrais `<Link>` uniquement sur la page d'accueil**
(`isHome ? <Link> : <span role="button" onClick={() => window.open(...)}>`
— hook `useIsHome`, maintenant supprimé). Sur les 6 autres pages : le logo,
les 6 liens de menu (desktop + mobile), le CTA "Particuliers" et le lien
LinkedIn (`Socials`) n'étaient **pas de vrais liens crawlables** — un
crawler qui lit le HTML sans simuler de clic n'avait accès à **aucune
navigation** dès qu'il quittait `/`. Ce n'était pas une histoire de
répartition du "jus" (la théorie du "PageRank sculpting" via nofollow est
de toute façon caduque depuis la confirmation de Google en 2009 : un lien
nofollow perd son jus, il ne le redistribue pas aux autres liens) — c'était
un graphe de liens internes coupé net après la home, en plus d'un bug
d'accessibilité (pas de clic-droit "nouvel onglet", pas de préchargement
Next.js).

**Corrigé, en TDD** (26 tests, `yarn vitest run` vert, `yarn build` et
`yarn lint` propres) :
- `Navbar.tsx` et `Footer.tsx` : suppression totale de la logique
  `isHome`/`useIsHome` (hook supprimé, plus aucun usage), vrais `<Link>`
  partout, sur toutes les pages.
- `Socials.tsx` : suppression du prop `isObfuscated` (mort maintenant que
  plus aucun appelant ne le passe à `true`), le lien LinkedIn est toujours
  un vrai `<a>`.
- `Footer.tsx` : "Politique de confidentialité" pointait vers `"#"` (lien
  mort, avec ou sans JS) — il n'existe pas de page dédiée, le contenu vit
  déjà dans `/mentions-legales` (section "Protection des données
  personnelles", RGPD, cookies). Pointé vers
  `/mentions-legales#protection-des-donnees-personnelles` (ancre ajoutée
  sur le `<h4>` correspondant) plutôt que d'inventer une page.
- Infra de test : `@testing-library/jest-dom` n'était pas installé
  (`toHaveAttribute` etc. absents) et `@testing-library/react` n'avait pas
  de cleanup entre tests (pas de `test.globals` dans `vitest.config.mjs`) —
  ajout de `vitest.setup.ts` (`afterEach(cleanup)` + jest-dom matchers).

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

1. ~~Ouvrir et merger la PR technique de `feat/seo-improvements`~~ — déjà en
   production sur `master` (section 1).
2. **Merger la chaîne blog dans l'ordre #29 → #36 → #37 → #43**, ou a minima
   valider et merger #29+#36 rapidement pour éviter que la chaîne continue
   de s'allonger avant que rien ne soit en `master`.
3. ~~Traiter le finding #1 de l'audit (maillage interne) en PR dédiée~~ —
   fait sur cette branche, en TDD, avec en prime la correction du bug
   Navbar/Footer bien plus impactant découvert au passage (section 2 bis).
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
