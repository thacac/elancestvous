---
stepsCompleted: [1, 2]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-elancestvous-2026-09-25/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-elancestvous-2026-09-26/ARCHITECTURE-SPINE.md
---

# elancestvous - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for elancestvous,
decomposing the requirements from the PRD and Architecture Spine into
implementable stories. Run bmad-ux `ux-elancestvous-2026-09-23` (DESIGN.md/
EXPERIENCE.md) excluded from extraction — `status: draft`, abandoned after two
rejected visual directions (bento SaaS, éditorial noir & blanc), and
explicitly superseded per PRD §0 by the Design Artifact mockups validated
later in the same session (not a parseable BMAD UX document, so not extracted
here — see UX Design Requirements section).

## Requirements Inventory

### Functional Requirements

FR1: Nav à 3 entrées racine + bouton Particuliers — Un visiteur peut naviguer depuis n'importe quelle page vers Formations, Coaching ou GAPP via la nav principale. Le bouton "Particuliers" du header reste visible en plus de ces 3 entrées, comme raccourci direct vers `/coaching/particuliers`.

FR2: Nouveau schéma d'URL — Le site expose `/formations` (hub + catalogue), `/formations/cadre-legal-etablissements-sante`, `/formations/prevention-rps-qvct-etablissements-sante`, `/formations/accompagnement-professionnel-etablissements-sante`, `/formations/dynamique-equipe-etablissements-sante`, `/coaching`, `/coaching/particuliers`, `/coaching/etablissements`, `/gapp-analyse-pratiques-professionnelles`. Chaque ancienne URL de service répond en 301 vers sa nouvelle URL.

FR3: Modèle de contenu formation — Le système lit des fichiers `content/formations/<slug>.md` avec frontmatter validé par un schéma zod incluant au minimum : titre, famille, objectifs pédagogiques, prérequis, public visé, programme, durée, format, délai d'accès, tarif, modalités d'évaluation, accessibilité + référent handicap, indicateurs de résultats.

FR4: Catalogue filtrable par catégorie — Le hub `/formations` liste toutes les Fiches formation, toutes Familles confondues, avec des pastilles de catégorie cliquables (les 4 Familles + Toutes) qui filtrent la liste.

FR5: Fiche formation individuelle — Chaque Fiche formation a sa propre page, avec colonne de contenu (objectifs, programme, public visé, modalités) et fiche pratique Qualiopi en sidebar (desktop) avec CTA primaire "Demander un devis".

FR6: Nouveau pilier de rotation blog + retargeting du pilier existant — Le système ajoute un pilier `F` ("Cadre légal, droits et éthique") à `PILLARS`, poids 4, `targetPage` vers `/formations/cadre-legal-etablissements-sante`. Le `targetPage` du pilier `C` existant ("Formations") est mis à jour vers `/formations/prevention-rps-qvct-etablissements-sante`.

FR7: Contenu marketing conservé sur chaque hub — Le contenu actuel de `formations-rps-qvct/page.tsx`, `coaching/page.tsx`, `coaching-individuel/page.tsx` et de la page GAPP est repris intégralement sur les nouvelles URLs, sans perte de section.

FR8: Section "Formations disponibles" en tête de hub Famille — Sur un hub Famille, la liste des Fiches formation de cette Famille apparaît comme premier bloc de la colonne de contenu, avant tout contenu de réassurance.

FR9: Le hub Formations liste les 4 Familles comme tuiles cliquables — Le hub Formations ajoute, en plus de son contenu conservé, une section de 4 tuiles cliquables vers chaque hub Famille, dans le même registre visuel que les tuiles piliers de la home, à plat, sans regroupement supplémentaire.

FR10: Articles de blog liés sur chaque hub Famille disposant d'un Pilier — Chaque hub Famille disposant d'un Pilier blog correspondant (Familles 1 et 2 pour l'instant) affiche jusqu'à 3 articles de blog récents rattachés à ce Pilier via `ArticlesBlogLiesBloc`, en colonne latérale sticky à partir de `lg`, empilée en pleine largeur en dessous de `lg`. Les hubs des Familles 3 et 4 n'affichent rien à cet endroit.

FR11: Section piliers en tuiles — La home affiche 3 tuiles (Formations, Coaching, GAPP) de poids visuel comparable — aucune ne domine les deux autres par sa taille ou sa position.

FR12: Bouton secondaire visible et cohérent — Tout CTA "Découvrir" / "Voir la fiche" est un élément bouton avec contour et fond teinté, jamais un lien texte seul, réutilisé identiquement sur home, catalogue et hub.

### NonFunctional Requirements

NFR1: Cohérence design system — Toutes les valeurs de police, radius et espacement des composants ajoutés correspondent à l'échelle Tailwind par défaut ; aucune valeur arbitraire hors échelle.

NFR2: Accessibilité des CTA — Le contraste du texte du bouton CTA secondaire respecte au moins 4.5:1 sur son fond, y compris sur la tuile Coaching (fond navy).

NFR3: Intégrité des données Qualiopi — Aucune donnée factuelle (tarif, durée exacte, taux de satisfaction, nom du référent handicap) n'est jamais inventée : un champ Qualiopi manquant affiche systématiquement un placeholder explicite et visuellement distinct, jamais une valeur fabriquée.

### Additional Requirements

- Projet brownfield existant (pas de starter template) : Next.js 16.2.2 / React 19.2.4 déjà en place. Cette refonte étend le paradigme content-as-code déjà utilisé par le blog — elle ne le remplace pas et n'introduit aucune nouvelle dépendance (zod ^4.3.6 et gray-matter restent les versions déjà utilisées par `lib/blog.ts`).
- `lib/formations.ts` doit répliquer exactement le paradigme de `lib/blog.ts` : `gray-matter` + schéma `zod`, détection de slug dupliqué, un type `FormationMeta` exporté. Slug en kebab-case, même regex que `lib/blog.ts` ; pas de champ date de publication (contenu non chronologique, contrairement au blog).
- Champ `famille` : enum local à 4 valeurs fixes défini dans `lib/formations.ts`, **jamais** validé contre `PILLAR_IDS` de `services/blog/pillars.ts` — les deux systèmes de classification (Famille catalogue / Pilier blog) restent distincts et non synchronisés (AD-1). Une Fiche formation ne référence jamais un Pilier blog.
- `services/blog/pillars.ts` : ajouter l'entrée pilier `F` (poids 4, `targetPage` `/formations/cadre-legal-etablissements-sante`) ; retargeter le `targetPage` du pilier `C` existant vers `/formations/prevention-rps-qvct-etablissements-sante`. Aucun code ne doit référencer l'id `"F"` littéralement en dehors du tableau `PILLARS` — `pickNextPillar`, `getRelatedArticleLinks` et `ArticlesBlogLiesBloc` restent génériques (AD-2).
- Redirections 301 : déclarées dans le bloc `async redirects()` de `next.config.ts` (à ajouter à côté du bloc `headers()` existant) — aucun `middleware.ts` introduit pour ce besoin (AD-3).
- Routing : un `page.tsx` statique écrit à la main par hub/Famille (`app/formations/page.tsx`, un par Famille, `app/coaching/**`, `app/gapp-analyse-pratiques-professionnelles/page.tsx`) — aucun moteur de rendu générique piloté par contenu. Seule la Fiche formation individuelle est un segment dynamique `app/formations/[famille]/[slug]/page.tsx` avec `generateStaticParams` sur `lib/formations.ts`, miroir exact de `app/blog/[slug]/page.tsx` (AD-4).
- Filtre catalogue : lu depuis `searchParams` sur le Server Component de `/formations` (ex. `?famille=...`), jamais un state React client ; les pastilles de catégorie sont des `<Link>` (AD-5).
- CTA secondaire : nouveau `variant` ajouté au `cva` existant de `components/ui/button.tsx` (`buttonVariants`) — aucun nouveau composant bouton, aucun `<a>` stylé à la main (AD-6).

### UX Design Requirements

Aucun document UX inclus dans cette extraction. Le run `bmad-ux` `ux-elancestvous-2026-09-23` est resté `status: draft`, abandonné après deux essais de direction visuelle rejetés (bento SaaS, éditorial noir & blanc), et exclu sur confirmation explicite de l'utilisateur. La référence visuelle réelle de ce chantier est l'ensemble des maquettes Design Artifact validées itérativement dans la session PRD/Architecture (registre "flat design, tuiles blanches à trait fin, icônes SVG en aplat, CTA à fond teinté") — non structurées comme document UX BMAD, donc non extraites sous forme d'UX-DR ici. Leurs contraintes testables sont déjà couvertes par NFR1, NFR2, FR11 et FR12 ci-dessus.

### FR Coverage Map

```
FR1: Epic 2 - Nav 3 piliers + bouton Particuliers
FR2: Epic 2 - Nouveau schéma d'URL + redirections 301
FR3: Epic 1 - Modèle de contenu formation
FR4: Epic 1 - Catalogue filtrable par famille
FR5: Epic 1 - Fiche formation individuelle
FR6: Epic 3 - Pilier blog "Cadre légal" + retargeting pilier "Formations"
FR7: Epic 2 - Contenu marketing conservé sur chaque hub
FR8: Epic 2 - Section "Formations disponibles" en tête de hub Famille
FR9: Epic 2 - Hub Formations : tuiles vers les 4 familles
FR10: Epic 3 - Articles de blog liés sur hub Famille
FR11: Epic 2 - Home en tuiles
FR12: Epic 1 - Bouton CTA secondaire
```

**Couverture des User Journeys (PRD §2.3)** — validé en party-mode le 27/09 :
- UJ-1 (Amandine, formation QVCT) : se ferme avec Epic 1 + Epic 2.
- UJ-2 (Marc, obligation légale via blog) : se ferme avec Epic 2 + Epic 3 (le maillage retour n'existe qu'à Epic 3).
- UJ-3 (Sophie compare des formations sur le catalogue) : se ferme avec Epic 1 seul — n'exige pas la nouvelle nav.

## Epic List

### Epic 1: Catalogue de formations Qualiopi
Un professionnel peut consulter le catalogue de formations, filtrer par famille,
ouvrir une fiche complète (Qualiopi) et demander un devis — y compris via un
lien direct, avant même que la nouvelle nav/arborescence ne soit branchée
(ferme UJ-3 à lui seul). Construit en premier : zéro dépendance vers la nav,
les URLs ou les hubs (validé en party-mode — Winston/Amelia), et retire tôt le
risque le plus incertain du projet (visibilité réelle des CTA sur du contenu
Qualiopi complet, cf. l'incident CTA "inexistants" plus tôt dans la session).
**FRs couverts:** FR3, FR4, FR5, FR12
**Implementation Notes:** `lib/formations.ts` + `content/formations/` n'ont
aucune dépendance vers Epic 2/3 — peuvent démarrer immédiatement. FR12 (variant
CTA) est introduit ici car FR4/FR5 en ont besoin ; Epic 2 le réutilise tel
quel. `app/formations/page.tsx` est créé ici pour la grille filtrable (FR4)
uniquement — la story FR4 doit noter explicitement que la section "tuiles vers
les 4 familles" (FR9) n'en fait pas partie et sera ajoutée par Epic 2
au-dessus du contenu existant, jamais au milieu de la grille (le Glossary du
PRD et AD-4 établissent que `/formations` est à la fois Hub et Catalogue —
un seul fichier, deux features à des moments différents, pas un découpage
technique caché).

### Epic 2: Nouvelle arborescence Formations / Coaching / GAPP
Un visiteur navigue toute la nouvelle IA (home → nav 3 piliers + bouton
Particuliers → hubs Formations/Coaching/GAPP) sur les nouvelles URLs, sans
perdre le contenu marketing existant, avec les anciennes URLs qui redirigent
proprement.
**FRs couverts:** FR1, FR2, FR7, FR8, FR9, FR11
**Implementation Notes:** Dépend d'Epic 1 pour que les hubs Famille (FR8)
affichent du contenu réel — techniquement, le `page.tsx` de chaque hub Famille
appelle une fonction de `lib/formations.ts` créée par Epic 1. Build réel dans
l'ordre 1 → 2, pas seulement la numérotation (confirmé). Reste fonctionnel
seul via l'état vide honnête déjà spécifié (UJ-1, edge case) si testé isolément.
FR9 ajoute la section tuiles sur `app/formations/page.tsx` déjà créé en Epic 1
(cf. note Epic 1). Root a confirmé qu'une fenêtre transitoire de lien mort
entre epics n'est pas un problème — tout sera testé en fin de chantier.

### Epic 3: Maillage blog ↔ formations
Un lecteur d'article de blog découvre automatiquement l'offre associée (Cadre
légal ou Prévention RPS/QVCT) via un encart sur le hub Famille correspondant.
**FRs couverts:** FR6, FR10
**Implementation Notes:** Dépend des hubs Famille d'Epic 2 pour avoir une
cible d'affichage. Mécanisme (`ArticlesBlogLiesBloc`, `lib/relatedArticles.ts`)
déjà générique et inchangé — épique volontairement fin. Ferme UJ-2 en
combinaison avec Epic 2 (le hub seul ne suffit pas sans le retargeting du
pilier et le nouveau pilier F).

## Epic 1: Catalogue de formations Qualiopi

Un professionnel peut consulter le catalogue de formations, filtrer par
famille, ouvrir une fiche complète (Qualiopi) et demander un devis — y
compris via un lien direct, avant même que la nouvelle nav/arborescence ne
soit branchée. **FRs couverts:** FR3, FR4, FR5, FR12. **NFRs:** NFR1, NFR2, NFR3.

### Story 1.1: Modèle de contenu formation

As a membre de l'équipe éditoriale qui rédige les fiches formation,
I want écrire un fichier `content/formations/<slug>.md` avec un frontmatter structuré,
So that ma fiche est validée et exploitable par le site sans qu'aucune donnée ne soit jamais inventée à sa place.

**Acceptance Criteria:**

**Given** un fichier `content/formations/<slug>.md` avec un frontmatter complet et valide
**When** le build lit le répertoire via `lib/formations.ts`
**Then** la fiche est exposée par un type `FormationMeta` exporté avec tous les champs du frontmatter
**And** le comportement réplique le paradigme de `lib/blog.ts` (gray-matter + zod)

**Given** un fichier formation sans champ `famille` valide (une des 4 valeurs fixes)
**When** le build valide le frontmatter
**Then** la validation échoue explicitement (erreur zod), bloquant le build

**Given** un champ Qualiopi optionnel absent (tarif, référent handicap, etc.)
**When** la fiche est chargée
**Then** le champ est exposé comme placeholder explicite, jamais comme valeur inventée

**Given** deux fichiers formation partageant le même slug
**When** `lib/formations.ts` charge le répertoire
**Then** une erreur de slug dupliqué est levée (miroir de `lib/blog.ts`)

**Given** les 2 fiches d'exemple déjà esquissées en maquette ("Obligations légales des établissements", Famille "Cadre légal, droits et éthique" ; "Diagnostic et plan d'action QVCT", Famille "Prévention des RPS et QVCT") créées comme contenu réel
**When** `lib/formations.ts` liste toutes les fiches
**Then** les deux apparaissent avec leur `famille` correcte

### Story 1.2: Variant CTA secondaire

As a visiteur qui découvre une tuile, une carte catalogue ou une fiche,
I want voir un bouton "Découvrir" / "Voir la fiche" nettement visible (contour + fond teinté),
So that je comprends immédiatement où cliquer, sans le confondre avec un lien texte nu.

**Acceptance Criteria:**

**Given** `components/ui/button.tsx` (`buttonVariants`, `cva`)
**When** un nouveau `variant` secondaire teinté est ajouté
**Then** il reste `rounded-md`/`shadow-sm` comme les variants existants
**And** aucun nouveau composant bouton n'est créé

**Given** ce variant appliqué sur un fond clair (blanc/pastel)
**When** on mesure le contraste texte/fond
**Then** il respecte au moins 4.5:1

**Given** ce variant appliqué sur un fond navy (tuile Coaching)
**When** on mesure le contraste texte/fond
**Then** il respecte au moins 4.5:1

**Given** les valeurs de police/radius/espacement du nouveau variant
**When** on les compare à l'échelle Tailwind par défaut
**Then** aucune valeur n'est hors échelle

### Story 1.3: Fiche formation individuelle

As a référent QVCT/RH qui envisage une formation,
I want consulter une fiche complète (objectifs, programme, public visé, modalités) avec sa fiche pratique Qualiopi toujours visible,
So that je peux vérifier durée/tarif/accessibilité et demander un devis sans chercher l'info ailleurs.

**Acceptance Criteria:**

**Given** une fiche formation valide (Story 1.1)
**When** je visite `/formations/[famille]/[slug]`
**Then** la page affiche la colonne de contenu (objectifs, programme, public visé, modalités)
**And** une fiche pratique Qualiopi est affichée en sidebar

**Given** la page desktop
**When** je fais défiler la colonne de contenu
**Then** la fiche pratique reste visible (`position: sticky`)

**Given** la fiche pratique
**When** elle s'affiche
**Then** le CTA "Demander un devis" est un bouton plein (variant primaire existant, pas le variant de Story 1.2)
**And** ce n'est jamais un lien texte

**Given** un champ Qualiopi optionnel absent dans le frontmatter
**When** la fiche pratique l'affiche
**Then** un placeholder visuellement distinct apparaît, jamais une valeur inventée

**Given** `lib/formations.ts`
**When** `generateStaticParams` est appelé
**Then** toutes les fiches valides génèrent une route statique
**And** le mécanisme est un miroir exact de `app/blog/[slug]/page.tsx`

### Story 1.4: Catalogue filtrable par famille

As a cadre de santé qui compare plusieurs formations,
I want parcourir `/formations` et filtrer par famille via des pastilles cliquables,
So that je peux comparer rapidement les formations d'une même famille avant de choisir.

**Acceptance Criteria:**

**Given** le hub `/formations` sans filtre
**When** je le visite
**Then** toutes les fiches de toutes les familles sont listées
**And** chacune affiche sa pastille de catégorie, sa durée, et un lien "Voir la fiche" stylé en bouton (Story 1.2)

**Given** une pastille de catégorie
**When** je clique dessus
**Then** seules les fiches de cette famille restent affichées

**Given** un filtre actif
**When** je clique la pastille "Toutes"
**Then** la liste complète est restaurée

**Given** un filtre actif (ex. `?famille=cadre-legal-etablissements-sante`)
**When** je rafraîchis la page ou partage l'URL
**Then** le filtre reste appliqué (lu depuis `searchParams` côté Server Component, jamais un state client)

**Given** une carte de la grille
**When** je clique "Voir la fiche"
**Then** j'atterris sur la page de la fiche créée en Story 1.3

**Given** cette page livrée seule (Epic 1 sans Epic 2)
**When** on l'inspecte
**Then** la grille filtrable est complète et fonctionnelle
**And** la section "tuiles vers les 4 familles" (FR9) n'existe pas encore — elle sera ajoutée par Epic 2 au-dessus, sans modifier cette grille
