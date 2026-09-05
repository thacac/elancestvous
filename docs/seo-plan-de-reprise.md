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

## 2 ter. Audit outillé (`claude-seo`) — validation + 2 nouveaux bugs trouvés et corrigés

Installation du plugin [`claude-seo`](https://github.com/AgriciDaniel/claude-seo)
v2.2.5 (25 sous-skills) à la demande explicite, pour croiser les constats
manuels avec un outillage réel plutôt que de continuer en lecture de code
seule.

**Limite d'environnement** : tous les scripts réseau du plugin
(`fetch_page.py`, `render_page.py`, `capture_screenshot.py`, PageSpeed/CrUX…)
échouent dans ce sandbox — leur protection SSRF interne (`url_safety.py`)
rejette comme « IP non-publique » le proxy loopback obligatoire de
l'environnement (`127.0.0.1`), avant même d'atteindre le site. Ce n'est pas
un bug du site : c'est une incompatibilité entre le sandbox et le
durcissement SSRF du plugin, et il n'a pas été question de désactiver cette
protection (code de sécurité tiers). Contournement : récupération des pages
en prod via `curl` (qui passe le proxy sans problème), puis analyse de ce
HTML avec les scripts du plugin qui acceptent un fichier local
(`parse_html.py`, `content_quality.py`). **Conséquence : Core Web Vitals
réels, captures d'écran et audit visuel n'ont pas pu être obtenus depuis
cette session** — à relancer un jour depuis un poste sans ce proxy, ou via
Search Console / PageSpeed Insights manuellement.

Résultats sur les 8 pages indexables + `robots.txt` + `sitemap.xml` :

- **Sitemap et robots.txt propres** : 7 URLs indexables (mentions-légales
  bien exclue), `/blog` explicitement disallow tant que `BLOG_ENABLED` est
  faux. Rien à corriger.
- **JSON-LD `@graph` bien présent sur les 8 pages** (`WebSite` + `Person` +
  `ProfessionalService`), confirme le correctif de la section 1.
- **Qualité de contenu (scoring QRG) : 91-92/100 sur les 8 pages.** Un flag
  « repetitive » sort partout — normal, le scorer lit le HTML complet et
  Navbar/Footer sont identiques mot pour mot sur chaque page ; ce n'est pas
  du contenu dupliqué au sens Google (qui regarde le contenu principal),
  mais confirme qu'il n'y a pas de quoi s'inquiéter sur la qualité
  rédactionnelle en l'état.
- **Finding #3 de la section 2 reconfirmé** : chaque page de service n'a que
  2 images (logo + visuel du menu), aucune illustration de contenu.
- **2 nouveaux bugs trouvés, corrigés en TDD sur cette branche** (test
  ajouté d'abord, rouge confirmé sur les 10 assertions, puis fix) :
  - **`og:image` absent sur les 8 pages "réelles" du site** (accueil,
    à-propos, contact, 2× coaching, formations, GAPP, index blog) — seule
    `mentions-légales` avait une image. Cause : Next.js ne fusionne pas
    `openGraph`/`twitter` en profondeur entre le layout racine et une page ;
    dès qu'une page redéclare `openGraph` (pour son propre titre/description/
    url), l'objet entier du layout racine — `images` compris — est remplacé,
    pas fusionné. Un partage LinkedIn/Facebook de n'importe quelle page du
    site n'affichait donc aucune image de prévisualisation. Fix : constante
    partagée `lib/openGraph.ts` (`OG_BANNER_IMAGES`, `TWITTER_BANNER_IMAGES`),
    réinjectée dans chaque `openGraph`/`twitter` qui se redéclare (layout
    racine inclus, pour ne garder qu'une seule source de vérité). Test :
    `app/__tests__/opengraph-images.test.ts`.
  - **`og:url` de `/mentions-legales` pointait vers la page d'accueil** au
    lieu d'elle-même — seule page à ne jamais redéclarer `openGraph` du
    tout, elle héritait donc de `openGraph.url: "https://elancestvous.fr"`
    du layout racine tel quel. Fix : `openGraph.url` explicite ajouté à
    cette page (impact mineur, la page est en `noindex`, mais incorrect
    pour un partage direct de son lien).
- **Nouveau : aucun header de sécurité HTTP** (`Strict-Transport-Security`,
  `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`) — vérifié par `curl -D -` sur plusieurs pages,
  confirmé par lecture de `next.config.ts` : pas de fonction `headers()` du
  tout. N'empêche pas l'indexation mais dégrade le score "Bonnes pratiques"
  Lighthouse/PageSpeed et les signaux de confiance. Corrigé en TDD
  (`next.config.test.ts`) par l'ajout d'un `headers()` appliquant ces 5
  en-têtes à toutes les routes.
- **Positif à noter** : `/llms.txt` existe déjà (généré par la chaîne blog
  mergée, section 3) — accessibilité aux crawlers IA (GEO) déjà en place.

Validé avant commit : `yarn vitest run` (63 tests, tous verts),
`yarn lint` (0 erreur — les warnings restants sont ceux déjà pris en charge
par la session dédiée au nettoyage ESLint), `yarn build` propre.

## 3. Volet contenu (blog) — chaîne #29 → #36 → #37 → #43 mergée dans `master`

Toute la chaîne est passée dans `master` (confirmé par `git log
origin/master`, plus plus aucune de ces PRs listée comme ouverte). Récupéré
sur `feat/seo-improvements` par merge de `master` (un seul conflit, dans
`components/Navbar.tsx` : master ajoutait le prop `blogEnabled` au même
endroit où cette branche retirait `useIsHome` — résolu en gardant
`blogEnabled`, sans réintroduire `isHome`).

Ce qui arrive avec la chaîne mergée :
- `app/blog/`, `app/api/blog/generate/`, `services/blog/*`, `lib/blog.ts`,
  `lib/featureFlags.ts` : pipeline de contenu + génération IA hebdomadaire
  en zone de relecture.
- 2 articles déjà rédigés dans `content/blog/*.md` (pilier C : QVCT/RPS).
- `docs/blog-plan-editorial.md`, `docs/seo-audit-pages-existantes.md`,
  `docs/blog-architecture.md`, `docs/blog-charte-editoriale.md`,
  `docs/blog-guide-validation-discord.md`, `docs/blog-secrets.md`.
- **`/blog` et `/blog/[slug]` sont derrière un flag serveur `BLOG_ENABLED`**
  (`lib/featureFlags.ts`, `isBlogPublic()`), désactivé par défaut : tant
  qu'il n'est pas mis à `"true"` en variable d'env/secret (+ redéploiement,
  ce n'est pas un toggle "live"), le blog renvoie 404 et n'apparaît ni dans
  la navbar ni dans le sitemap. Rien d'exposé involontairement tant que ce
  n'est pas activé délibérément.

Le plan éditorial (`docs/blog-plan-editorial.md`) mappe 12 semaines
d'articles à un mot-clé, une intention de recherche et **une page de
service cible pour le maillage interne** (piliers coaching individuel /
coaching établissement / QVCT-RPS / GAPP + un axe SEO local
Toulouse/Occitanie). Le premier article visé était daté du 08/09/2026 — à
recaler selon la date réelle d'activation de `BLOG_ENABLED`.

## 4. Séquencement recommandé

1. ~~Ouvrir et merger la PR technique de `feat/seo-improvements`~~ — déjà en
   production sur `master` (section 1).
2. ~~Merger la chaîne blog #29 → #36 → #37 → #43~~ — fait, dans `master`
   (section 3).
3. ~~Traiter le finding #1 de l'audit (maillage interne) en PR dédiée~~ —
   fait sur cette branche, en TDD, avec en prime la correction du bug
   Navbar/Footer bien plus impactant découvert au passage (section 2 bis).
3 bis. ~~Installer `claude-seo` et refaire un audit outillé~~ — fait
   (section 2 ter) : sitemap/robots/JSON-LD validés, contenu 91-92/100,
   finding #3 (images) reconfirmé, et 2 nouveaux bugs trouvés + corrigés en
   TDD (`og:image` absent partout, `og:url` faux sur `/mentions-legales`) +
   ajout des headers de sécurité HTTP manquants. Core Web Vitals réels et
   captures d'écran restent à faire hors de ce sandbox (proxy réseau
   incompatible avec la protection SSRF du plugin).
4. **Décider de la date d'activation de `BLOG_ENABLED`** (secret serveur,
   nécessite un redéploiement — voir `lib/featureFlags.ts`), puis une fois
   le blog en ligne et le premier article publié : implémenter le
   mécanisme décrit en section 4 de
   `docs/blog-plan-editorial.md` (fichier `content/blog/sujets-prioritaires.json`
   consommé par `generateDraft.ts`, avec TDD) pour que la génération
   hebdomadaire suive réellement le calendrier de mots-clés plutôt que de
   proposer des sujets libres.
5. **Finding #3 (images) et #4 (breadcrumbs)** : à planifier après le
   maillage interne, priorité basse — ne bloquent rien d'autre.
6. ~~Installer et exécuter `claude-seo`~~ — fait (section 2 ter, étape 3 bis).
   Reste à relancer les volets Core Web Vitals/captures d'écran depuis un
   environnement sans proxy loopback obligatoire.
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
