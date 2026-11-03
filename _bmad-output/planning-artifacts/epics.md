---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-elancestvous-2026-09-25/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-elancestvous-2026-09-26/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-elancestvous-2026-09-23/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-elancestvous-2026-09-23/EXPERIENCE.md
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

**Mise à jour 2026-10-30, charte inspirée des slides.** Le run `ux-elancestvous-2026-09-23` a été repris en mode Update et finalisé (`status: final`) à partir des slides de formation fournies par Cédric. `DESIGN.md` et `EXPERIENCE.md` font désormais référence et **remplacent le registre « tuiles blanches à trait fin »** de la PRD §4.6. FR11 (3 tuiles de poids égal), FR12 (bouton secondaire teinté, jamais de pill), NFR1, NFR2 et NFR3 restent en vigueur. Exigences UX extraites pour l'Epic 4 :

UX-DR1: Chaque section restylée s'ouvre sur un `SectionBanner` qui rend un vrai titre Hn, au niveau imposé par la hiérarchie de la page.
UX-DR2: Les groupes de contenus parallèles utilisent des `PastelCard` aux teintes alternées (ciel, pêche, vert d'eau, lilas), jamais une rangée uniforme.
UX-DR3: Le texte orange et les boutons orange utilisent `accent` (orange foncé #a64d08) ; l'orange vif est réservé au décor (contraste ≥ 4.5:1). Palette limitée aux 8 couleurs de DESIGN.md.
UX-DR4: Les démarches ordonnées utilisent `Steps` (`<ol role="list">`), les messages à retenir `KeyMessage` (`role="note"`), au plus un par section.
UX-DR5: Le décor (vagues, étincelles, pinceau, flèches, icônes de bandeau) est `aria-hidden`, et aucune animation automatique ne dure plus de 5 s.
UX-DR6: Aucun titre, texte indexé ni URL n'est modifié pour les besoins du style (SEO d'abord) ; un contenu ajouté (étapes, repères chiffrés) est sourcé et validé.
UX-DR7: Les valeurs Tailwind restent sur l'échelle par défaut (NFR1) ; les valeurs arbitraires existantes de `Bubble` sont résorbées.

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

**Couverture UX-DR (Epic 4, ajouté le 2026-10-30)** : UX-DR1 à UX-DR7 → Epic 4 ; chaque story 4.2 à 4.6 applique UX-DR1 à UX-DR6 sur son périmètre, et la story 4.1 couvre UX-DR5 et UX-DR7.

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

### Epic 4: Charte inspirée des slides de formation
Un visiteur retrouve sur tout le site l'expérience des slides de formation :
bandeaux pétrole, cartes pastel, questions qui l'interpellent, logo variante
C. Le référencement et le contenu indexé restent intacts.
**UX-DR couverts:** UX-DR1 à UX-DR7 (voir `ux-designs/ux-elancestvous-2026-09-23/DESIGN.md` et `EXPERIENCE.md`)
**Implementation Notes:** S'appuie sur les pages livrées par les Epics 1 à 3
sans en changer les URLs ni le contenu. La story 4.1 est livrée (PR #133). Les
stories 4.2 à 4.6 sont indépendantes entre elles et peuvent être livrées dans
n'importe quel ordre, mais **ne pas promouvoir `validation` → `master` avant
4.2** : sans elle, la production mélangerait la nouvelle typographie et les
anciennes mises en page. Une PR par story, vers `validation`.

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

**Given** le champ `famille` d'une fiche formation
**When** il est validé
**Then** il est vérifié contre un enum local à 4 valeurs fixes défini dans `lib/formations.ts`
**And** jamais contre `PILLAR_IDS` de `services/blog/pillars.ts` — les deux systèmes de classification (Famille catalogue / Pilier blog) restent indépendants (AD-1)

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

## Epic 2: Nouvelle arborescence Formations / Coaching / GAPP

Un visiteur navigue toute la nouvelle IA (home → nav 3 piliers + bouton
Particuliers → hubs Formations/Coaching/GAPP) sur les nouvelles URLs, sans
perdre le contenu marketing existant, avec les anciennes URLs qui redirigent
proprement. **FRs couverts:** FR1, FR2, FR7, FR8, FR9, FR11. Séquencé pour
qu'aucune story ne dépende d'une story future : les hubs (2.1-2.3) sont
construits avant les pages qui pointent vers eux (2.4 tuiles, 2.5 home, 2.6
nav), et les redirections (2.7) ferment la marche une fois toutes les cibles
réelles en place. Le hub "Cadre légal, droits et éthique" n'a **aucune** page
source existante à migrer, contrairement au hub "Prévention des RPS et QVCT"
(confirmé par l'utilisateur, 28/09) — son contenu marketing est entièrement à
rédiger, au même titre que les hubs des Familles 3 et 4, mais avec des fiches
formation réelles à afficher dès le départ (contrairement à 3/4).

### Story 2.1: Hubs Coaching + GAPP — contenu conservé sur nouvelles URLs

As a visiteur intéressé par un accompagnement coaching ou un GAPP,
I want retrouver tout le contenu marketing existant sur les nouvelles URLs,
So that rien de ce qui me convainquait avant n'a disparu, seule l'adresse a changé.

**Acceptance Criteria:**

**Given** le contenu actuel de `coaching/page.tsx`, `coaching-individuel/page.tsx` et de la page GAPP
**When** il est repris sur `/coaching`, `/coaching/particuliers`, `/coaching/etablissements`, `/gapp-analyse-pratiques-professionnelles`
**Then** aucune section de contenu marketing n'est supprimée par rapport à l'original

**Given** `/coaching`
**When** je le visite
**Then** il distribue clairement vers les deux publics (particuliers/établissements)

**Given** `/coaching/etablissements`
**When** je le visite
**Then** son contenu est celui de l'actuelle page établissement, inchangé

**Given** `/gapp-analyse-pratiques-professionnelles`
**When** je le visite
**Then** son contenu est celui de la page GAPP actuelle, inchangé

### Story 2.2: Hubs Famille "Cadre légal" et "Prévention RPS/QVCT"

As a directeur d'établissement ou référent QVCT qui cherche de l'info dans son domaine,
I want arriver sur un hub qui garde le contenu de réassurance existant et me montre en premier les formations disponibles,
So that je vois tout de suite si une formation répond à mon besoin, sans devoir chercher en bas de page.

**Acceptance Criteria:**

**Given** le contenu actuel de `formations-rps-qvct/page.tsx`
**When** il est repris sur `/formations/prevention-rps-qvct-etablissements-sante`
**Then** aucune section n'est supprimée

**Given** `/formations/cadre-legal-etablissements-sante`
**When** je le visite
**Then** du contenu marketing/de réassurance nouveau (rédigé pour ce chantier, aucune page source existante à migrer) y est présent

**Given** ces deux hubs
**When** je les visite
**Then** la section "Formations disponibles" apparaît comme premier bloc de la colonne de contenu, avant tout contenu de réassurance
**And** elle liste les fiches réelles créées en Story 1.1

**Given** ces deux hubs
**When** on vérifie l'ordre du DOM
**Then** aucun contenu de réassurance (pédagogie, public cible) ne précède la section "Formations disponibles"

### Story 2.3: Hubs Famille "Accompagnement..." et "Dynamique d'équipe..."

As a visiteur qui explore le catalogue Formations pour la première fois,
I want que même une famille sans formation encore publiée montre un état honnête plutôt qu'une liste tronquée ou une page cassée,
So that je comprends que l'offre existe et arrive bientôt, sans avoir l'impression d'un site à moitié fini.

**Acceptance Criteria:**

**Given** `/formations/accompagnement-professionnel-etablissements-sante` et `/formations/dynamique-equipe-etablissements-sante`
**When** je les visite
**Then** chacun affiche du contenu marketing rédigé pour ce chantier (aucune page source existante)

**Given** qu'aucune Fiche formation n'existe encore pour ces deux familles
**When** la section "Formations disponibles" s'affiche
**Then** elle montre un état vide honnête (pas de liste tronquée, pas d'erreur) — cf. edge case UJ-1 du PRD

**Given** ces deux hubs
**When** on vérifie le maillage retour blog
**Then** rien ne s'affiche à cet endroit (Epic 3 s'en charge ; ces familles n'ont pas de pilier)

### Story 2.4: Hub Formations — tuiles vers les 4 familles

As a visiteur qui arrive sur `/formations` sans idée précise de la famille qui le concerne,
I want voir les 4 familles présentées comme tuiles cliquables,
So that je peux choisir directement la bonne famille avant de me plonger dans le catalogue filtrable.

**Acceptance Criteria:**

**Given** `/formations` (créé en Epic 1, Story 1.4)
**When** Epic 2 y ajoute la section tuiles
**Then** 4 tuiles cliquables apparaissent, une par famille, menant vers les hubs créés en Story 2.2/2.3

**Given** ces tuiles
**When** comparées visuellement aux tuiles piliers de la home (Story 2.5)
**Then** elles utilisent le même registre visuel
**And** aucun regroupement en 2 groupes n'est réintroduit ("groupe sémantique" abandonné)

**Given** la grille filtrable de Story 1.4
**When** la section tuiles est ajoutée
**Then** elle est positionnée au-dessus du contenu existant, sans modifier la grille elle-même

### Story 2.5: Home en tuiles

As a visiteur qui arrive sur la home,
I want voir 3 tuiles de poids visuel comparable pour Formations, Coaching, GAPP,
So that je comprends en un coup d'œil les 3 façons de m'accompagner, sans qu'aucune n'écrase les autres.

**Acceptance Criteria:**

**Given** la home
**When** je consulte la section piliers en desktop
**Then** les 3 tuiles (Formations, Coaching, GAPP) ont la même hauteur et largeur dans la grille

**Given** le Hero
**When** la home se charge
**Then** il reste inchangé (fond pastel, logo, CTA "Solutions pour les établissements", callout particulier)

**Given** chaque tuile
**When** elle s'affiche
**Then** son CTA "Découvrir..." utilise le variant secondaire de Story 1.2

**Given** la tuile Formations/Coaching/GAPP
**When** cliquée
**Then** elle mène respectivement vers `/formations`, `/coaching`, `/gapp-analyse-pratiques-professionnelles` (toutes créées dans les stories précédentes)

### Story 2.6: Nav à 3 piliers + bouton Particuliers

As a visiteur sur n'importe quelle page du site,
I want naviguer vers Formations, Coaching ou GAPP depuis la nav principale, et trouver rapidement l'accompagnement individuel si je suis un particulier,
So that je trouve mon chemin sans avoir à deviner où chercher.

**Acceptance Criteria:**

**Given** n'importe quelle page
**When** je consulte la nav principale
**Then** je peux naviguer vers Formations, Coaching et GAPP

**Given** la nav
**When** je la consulte
**Then** elle ne contient aucune entrée "Obligations légales" de premier niveau
**And** GAPP reste un lien direct, jamais un sous-élément de Formations

**Given** le bouton "Particuliers" du header
**When** je consulte n'importe quelle page
**Then** il reste présent et cliquable, menant vers `/coaching/particuliers`
**And** ceci indépendamment de l'entrée Coaching

### Story 2.7: Redirections 301 des anciennes URLs

As a visiteur qui a un ancien lien vers le site (partagé, indexé, ou en favori),
I want être redirigé automatiquement vers la nouvelle URL correspondante,
So that je n'atterris jamais sur une page cassée, même après la migration.

**Acceptance Criteria:**

**Given** l'ancienne URL `particuliers/coaching-individuel`
**When** elle est visitée
**Then** elle répond en 301 vers `/coaching/particuliers`

**Given** les anciennes URLs `professionnels-etablissements-de-soins/{coaching,formations-rps-qvct,gapp-groupe-analyse-pratiques-professionnelles}`
**When** elles sont visitées
**Then** chacune répond en 301 vers sa nouvelle URL correspondante (`/coaching/etablissements`, `/formations/prevention-rps-qvct-etablissements-sante`, `/gapp-analyse-pratiques-professionnelles`)

**Given** ces redirections
**When** elles sont déclarées
**Then** elles vivent dans le bloc `async redirects()` de `next.config.ts`, à côté du bloc `headers()` existant
**And** aucun `middleware.ts` n'est introduit

**Given** la migration terminée
**When** les préfixes `particuliers/` et `professionnels-etablissements-de-soins/` sont visités sur toute autre sous-page
**Then** ils ne servent plus aucune page

## Epic 3: Maillage blog ↔ formations

Un lecteur d'article de blog découvre automatiquement l'offre associée (Cadre
légal ou Prévention RPS/QVCT) via un encart sur le hub Famille correspondant.
**FRs couverts:** FR6, FR10. Épique volontairement fin : le mécanisme
(`ArticlesBlogLiesBloc`, `lib/relatedArticles.ts`) est déjà générique et
inchangé — seule la configuration des piliers change.

### Story 3.1: Nouveau pilier blog "Cadre légal" + retargeting du pilier existant

As a équipe éditoriale qui produit le blog hebdomadaire,
I want que le système propose aussi le pilier "Cadre légal" dans la rotation, et que le pilier "Formations" existant cible le bon hub,
So that le blog continue d'alimenter automatiquement les bonnes pages du nouveau site, sans article mal routé.

**Acceptance Criteria:**

**Given** `services/blog/pillars.ts`
**When** le pilier `F` est ajouté
**Then** il porte le label "Cadre légal, droits et éthique", un poids 4, et un `targetPage` `/formations/cadre-legal-etablissements-sante`

**Given** le pilier `C` existant ("Formations")
**When** son `targetPage` est mis à jour
**Then** il pointe vers `/formations/prevention-rps-qvct-etablissements-sante`

**Given** `pickNextPillar`
**When** il tire un pilier
**Then** il peut désormais sélectionner le pilier `F` au même titre que les autres

**Given** `getRelatedArticleLinks` (`lib/relatedArticles.ts`) et `ArticlesBlogLiesBloc`
**When** les piliers `C` et `F` sont utilisés
**Then** aucun code spécifique supplémentaire n'est nécessaire — le mécanisme reste générique par pilier

**Given** tout autre fichier du dépôt
**When** on cherche une référence littérale à l'id `"F"`
**Then** aucune n'existe en dehors du tableau `PILLARS`

### Story 3.2: Articles de blog liés sur chaque hub Famille disposant d'un pilier

As a lecteur d'un article de blog sur le cadre légal ou la prévention RPS/QVCT,
I want voir automatiquement les articles récents liés à ce sujet sur le hub Famille correspondant,
So that je découvre l'offre associée sans chercher, et je peux approfondir via d'autres articles.

**Acceptance Criteria:**

**Given** le hub Famille "Cadre légal" (Story 2.2) et le pilier `F` (Story 3.1)
**When** au moins un article de blog cible ce pilier
**Then** jusqu'à 3 articles récents s'affichent via `ArticlesBlogLiesBloc`, en colonne latérale sticky à partir du breakpoint `lg`
**And** empilée en pleine largeur en dessous de `lg`

**Given** le hub Famille "Prévention RPS/QVCT" et le pilier `C` retargeté
**When** au moins un article cible ce pilier
**Then** le même comportement s'applique

**Given** les hubs Famille "Accompagnement..." et "Dynamique d'équipe..." (Story 2.3, sans pilier)
**When** on les visite
**Then** `ArticlesBlogLiesBloc` ne rend rien à cet endroit, sans code spécial pour ce cas

**Given** un hub Famille avec pilier mais sans encore aucun article publié dessus
**When** on le visite
**Then** rien ne s'affiche à cet endroit non plus, plutôt qu'un bloc vide visible

## Epic 4: Charte inspirée des slides de formation

Un visiteur retrouve sur tout le site l'expérience des slides de formation,
sans perte de référencement. Référence : `DESIGN.md` / `EXPERIENCE.md` du run
`ux-elancestvous-2026-09-23` (finalisé le 2026-10-30).

### Story 4.1: Fondations de la charte et logo variante C

As a Cédric, qui pilote le site,
I want disposer de la palette, des polices et des composants de la charte, ainsi que du nouveau logo,
So that chaque page puisse ensuite être restylée de façon cohérente.

**Statut :** livrée, PR #133 vers `validation`.

**Acceptance Criteria:**

**Given** `app/globals.css` et `app/fonts.ts`
**When** le site se charge
**Then** les 8 couleurs de la charte (bleu nuit, pétrole, turquoise, turquoise du logo, orange vif, orange foncé, ciel, pêche) sont disponibles, et Nunito, Nunito Sans et Kalam sont auto-hébergées via next/font

**Given** `components/charte/`
**When** une page les importe
**Then** `SectionBanner`, `KeyMessage`, `Steps`, `PastelCard`/`Chip`, `Bubble`, `Wave`/`Sparkle`/`BrushUnderline` et `Logo` respectent UX-DR1, UX-DR4 et UX-DR5

**Given** le logo
**When** il s'affiche dans la barre de navigation ou en icône
**Then** c'est la variante C sans étincelles ; sur l'accueil, les étincelles scintillent deux fois puis se figent

**Given** les boutons orange et le pied de page
**When** on mesure le contraste du texte
**Then** il est d'au moins 4.5:1 (UX-DR3)

**Dette UX-DR7 soldée** : `Bubble` n'utilise plus de valeur arbitraire (revue de la story 4.1, vérifié et verrouillé par test en story 4.6).

### Story 4.2: Accueil aux couleurs des slides

As a visiteur établissement qui arrive sur l'accueil,
I want comprendre l'offre et me sentir interpellé comme en formation,
So that j'ai envie d'en parler à Coralie.

**Acceptance Criteria:**

**Given** l'accueil
**When** il se charge
**Then** le Hero garde son H1, son texte et ses deux appels à l'action, avec le logo à étincelles, la bulle « Et vous, comment allez-vous vraiment ? » et la photo ou une illustration de Coralie

**Given** la section des 3 axes
**When** on la consulte
**Then** elle s'ouvre sur un `SectionBanner` (h2) et les 3 tuiles restent de poids égal (FR11), en `PastelCard` aux teintes alternées, chacune avec son bouton secondaire (FR12)

**Given** la section « Comment se passe un accompagnement »
**When** on la consulte
**Then** elle présente une démarche en 4 étapes via `Steps`, avec un texte validé par Cédric (UX-DR6)

**Given** la fin de page
**When** on y arrive
**Then** une bulle-question et un `KeyMessage` mènent au contact, et le pied de page est précédé d'une `Wave`

**Given** le SEO
**When** on compare avant et après
**Then** le titre, la meta description, le H1 et les URLs sont inchangés, et la hiérarchie Hn reste valide

### Story 4.3: Hubs Coaching, GAPP et Formations restylés

As a visiteur qui explore un pilier,
I want retrouver les bandeaux et cartes de la charte sur les pages hub,
So that le parcours reste cohérent de l'accueil jusqu'au devis.

**Acceptance Criteria:**

**Given** `/coaching`, `/coaching/particuliers`, `/coaching/etablissements`, `/gapp-analyse-pratiques-professionnelles` et `/formations`
**When** on les consulte
**Then** chaque section existante s'ouvre sur un `SectionBanner` au niveau Hn d'origine, sans texte supprimé ni réécrit (FR7, UX-DR6)

**Given** les blocs `CtaElan`, `Citation`, `CartesContrastBloc`, `BadgesBloc` et `PublicsCiblesBloc`
**When** ils s'affichent
**Then** ils utilisent la charte (pastels, pétrole, `accent`) avec un contraste d'au moins 4.5:1

**Given** la page `/coaching/etablissements` ou le hub Formations
**When** on y ajoute des repères chiffrés (DREES, TraCov2 2023, publication juin 2025)
**Then** chaque chiffre affiche sa source, et rien n'est inventé (NFR3)

### Story 4.4: Catalogue, hubs Famille et fiches formation restylés

As a Amandine, référente QVCT,
I want parcourir le catalogue et les fiches dans la nouvelle charte,
So that je trouve, compare et demande un devis aussi facilement qu'avant.

**Acceptance Criteria:**

**Given** le catalogue `/formations` et les hubs Famille
**When** on les consulte
**Then** les pastilles de filtre restent des `<Link>` (AD-5), les cartes de formation passent en `PastelCard` et la section « Formations disponibles » reste en premier (FR8)

**Given** une fiche formation
**When** on la consulte
**Then** le programme utilise `Steps` s'il est séquentiel, la fiche pratique Qualiopi et le CTA « Demander un devis » restent visibles, et les placeholders Qualiopi restent visuellement distincts (NFR3)

### Story 4.5: Blog dans la charte

As a Marc, lecteur d'un article,
I want une lecture confortable avec l'essentiel mis en avant,
So that je retiens l'idée clé et je découvre l'offre associée.

**Acceptance Criteria:**

**Given** la liste du blog
**When** on la consulte
**Then** les cartes d'articles alternent les pastels, sans changer les titres ni les URLs

**Given** un article
**When** il s'affiche
**Then** la typographie de lecture est en Nunito Sans, et un `KeyMessage` peut clore l'article si le contenu en fournit un, sans modifier le pipeline de génération ni le flux de validation Discord

### Story 4.6: Liens orange lisibles et dette de la charte

As a visiteur malvoyant,
I want lire tous les liens orange sans effort,
So that aucun texte ne passe sous le seuil de contraste.

**Acceptance Criteria:**

**Given** les liens `text-accent` de taille courante (à propos, Hero, fiches)
**When** on mesure leur contraste
**Then** ils utilisent l'orange foncé `accent` (≥ 4.5:1), et les anciennes couleurs `secondary`, `muted` et `pastel` ne sont plus utilisées

**Given** `Bubble`
**When** on inspecte ses classes
**Then** il n'utilise plus de valeur Tailwind arbitraire (UX-DR7, NFR1)


### Story 4.7: Catalogue des formations resserré sur smartphone

As a Sophie, cadre de santé qui consulte le catalogue sur son téléphone,
I want voir les premières fiches de formation sans faire défiler plusieurs écrans,
So that je trouve vite une formation à proposer à mon équipe.

**Contexte (mesuré sur `validation` le 2026-11-01) :** la première fiche
arrivait à 2 312 px à 390 px de large (2,7 écrans) et à 2 579 px à 320 px
(3,1 écrans), derrière les 4 tuiles Famille (1 533 px) et 4 à 5 lignes de
filtres. Pistes retenues par Cédric : liste avant les tuiles, filtres sur une
ligne défilante, tuiles compactes, H1 réduit.

**Acceptance Criteria:**

**Given** `/formations` à 390 px et à 320 px
**When** la page se charge
**Then** la section « Toutes nos formations » (filtres et fiches) précède les tuiles Famille dans le HTML comme à l'écran, et la première fiche apparaît dans le premier écran

**Given** les filtres de catégorie sur smartphone
**When** on les consulte
**Then** ils tiennent sur une ligne qui défile dans son propre conteneur (fondu décoratif au bord droit), utilisable au clavier, restent des `<Link>` (AD-5) en `rounded-md`, et retrouvent leur disposition sur plusieurs lignes à partir de `sm`

**Given** les tuiles Famille
**When** on les consulte
**Then** elles s'ouvrent sur un bandeau h2 « Explorer les formations par famille » (titre ajouté, validé par Cédric), leurs titres passent en h3 sans changer de texte, et sur smartphone leur médaillon est réduit à côté du titre

**Given** le SEO et l'accessibilité
**When** on compare avant et après
**Then** title, meta, H1, textes, `alt` et URL (y compris `?famille=…#toutes-nos-formations`) sont inchangés, le H1 est réduit sur smartphone (`text-3xl!`), la hiérarchie Hn est sans saut, et la page ne défile pas horizontalement à 320 px

### Story 4.8: Vague du pied de page sur toutes les pages

As a visiteur qui passe d'une page à l'autre,
I want retrouver la même transition en vague avant le pied de page,
So that le site paraisse cohérent, quelle que soit la page où je finis ma lecture.

**Contexte (constat de Cédric, 2026-11-01) :** la vague était posée dans les
blocs `CtaElan` et `AppelContact` ; elle n'apparaissait que sur les 9 pages qui
finissent par l'un d'eux. Le pied de page lui-même était déjà un composant
unique, posé une fois dans le layout. Les marges basses des pages (`mb-40` du
catalogue, des fiches et du blog, etc.) restent inchangées dans cette story
(décision de Cédric, 2026-11-02).

**Acceptance Criteria:**

**Given** n'importe quelle page du site (accueil, hubs, catalogue, fiches, blog, contact, mentions légales)
**When** on arrive en bas de la page
**Then** le pied de page pétrole est précédé d'une seule `Wave`, et `CtaElan` et `AppelContact` n'en contiennent plus

**Given** la vague
**When** on inspecte le pied de page
**Then** elle fait partie de `Footer`, sur un fond transparent (elle prend le fond de la page), reste décorative (`aria-hidden`, `focusable="false"`), et le repère `footer` (contentinfo) est conservé avec ses liens inchangés

**Given** la jonction contenu / pied de page
**When** on la compare avant et après à 1280, 390 et 320 px
**Then** les pages qui avaient déjà la vague sont identiques, aucune page n'a de bande d'une autre couleur ni de double transition, et la page ne défile pas horizontalement à 320 px

**Given** la vague du Hero de l'accueil
**When** l'accueil se charge
**Then** elle est inchangée

### Story 4.9: À propos et Contact dans la charte

As a visiteur qui veut connaître Coralie puis lui écrire,
I want retrouver la charte des slides jusqu'au formulaire de contact,
So that je fasse confiance et que j'envoie ma demande sans effort, même sur mon téléphone.

**Contexte (mesuré sur `validation` le 2026-11-02) :** les deux pages étaient
restées dans le registre d'avant la charte. Sur `/contact`, les bordures des
champs faisaient 1.19:1 (WCAG 1.4.11), le contour des boutons radio 1.26:1,
l'aide du bouton radio coché 4.14:1, le point séparateur 2.59:1, et le bouton
d'envoi désactivé, qui porte la consigne « Remplissez le formulaire pour
envoyer », 2.02:1 ; le lien téléphone ne se distinguait du texte qu'au survol.
Sur `/a-propos`, environ 250 px de blanc précédaient le bloc final, la grille
des encarts portait une classe invalide et la photo une valeur arbitraire.
Décisions de Cédric (2026-11-02) : bandeau h2 « Mon parcours » ajouté,
paragraphes non justifiés, bloc commenté de prise de rendez-vous supprimé,
affichage des erreurs du formulaire renvoyé à une story dédiée.

**Acceptance Criteria:**

**Given** `/a-propos`
**When** on la consulte
**Then** title, meta, H1, sous-titre, textes, liens, `alt` de la photo et URL sont inchangés ; la biographie s'ouvre sur un `SectionBanner` h2 « Mon parcours » (titre ajouté, validé) ; la photo de Coralie est un médaillon rond sans ombre ni valeur arbitraire ; « Accompagnement humain. » est une annotation Kalam ; les encarts « 10+ » et « Coach » sont des `PastelCard` ciel et pêche, libellés en `stone-600` ; la phrase finale est un `KeyMessage` ; les paragraphes ne sont plus justifiés ; le H1 est réduit sur smartphone (`text-3xl!`)

**Given** `/contact`, avec ou sans `?type=&sujet=`
**When** on la consulte
**Then** title, meta, H1 et sous-titre sont inchangés ; le formulaire est dans une `PastelCard` ciel sans ombre et remonte sur smartphone (`pt-6 sm:pt-20`) ; le bouton d'envoi est en variante `accent`, son état désactivé reste lisible (fond `stone-600` opaque, 7.6:1) ; les bordures des champs font au moins 3:1 (`stone-600`) et le contour des boutons radio est bleu nuit ; aucun texte gris n'est sous `stone-600` ; le lien téléphone est souligné en `accent` ; le pré-remplissage, la validation et l'envoi sont inchangés

**Given** les deux pages à 1280, 390 et 320 px
**When** on compare avant et après
**Then** la hiérarchie Hn est sans saut, il n'y a ni double vague ni débordement horizontal à 320 px, et le blanc avant le bloc final de `/a-propos` passe d'environ 250 à 110 px (`mb-40` → `mb-12`), sans changer la jonction avec le pied de page

**À suivre (story dédiée, décision de Cédric) :** les messages d'erreur du
formulaire de contact ne s'affichent jamais (validation à l'envoi, bouton
désactivé tant que le formulaire est invalide, RGAA 11.10) ; le champ e-mail
affiche l'erreur de `lastName` ; chaque erreur est rendue deux fois ; les
exemples « Jean » / « Dupont » ressemblent à des valeurs saisies.

### Story 4.10: Liens explicites sur les cartes du catalogue

As a Amandine, qui navigue au lecteur d'écran dans la liste des liens,
I want que chaque lien « Découvrir » ou « Voir la fiche » dise où il mène,
So that je choisisse une famille ou une fiche sans revenir au contexte de la carte.

**Contexte (mesuré sur `validation` le 2026-11-02) :** le hub `/formations`
affiche 4 liens « Découvrir » vers 4 familles différentes, et chaque carte de
formation (catalogue et hubs Famille via `FormationsDisponiblesBloc`) un lien
« Voir la fiche » : dans une liste de liens, ces intitulés sont identiques
pour des destinations différentes (RGAA 6.1, WCAG 2.4.4). Les liens de
l'accueil (`Axes.tsx`, « Découvrir les formations »…) sont déjà explicites.
Périmètre élargi à « Voir la fiche » par Cédric (2026-11-02).

**Acceptance Criteria:**

**Given** les tuiles Famille du hub `/formations`
**When** on liste les liens au lecteur d'écran
**Then** chaque « Découvrir » a un nom accessible unique qui commence par le texte visible et se complète du nom de la famille en `sr-only` (« Découvrir : Prévention des RPS et QVCT »), sur le modèle des titres « Bientôt disponible » de la story 4.4 (WCAG 2.5.3 : le nom accessible contient le texte visible)

**Given** les cartes de formation du catalogue et des hubs Famille
**When** on liste les liens
**Then** chaque « Voir la fiche » se complète de la même façon du titre de la formation

**Given** le SEO et l'affichage
**When** on compare avant et après à 1280, 390 et 320 px
**Then** le texte visible, les URL et la mise en page sont inchangés, aucun `aria-label` n'est ajouté, et la page ne défile pas horizontalement à 320 px

### Story 4.11: Audit « smartphone d'abord » des autres pages et H1 réduits

As a Sophie, cadre de santé qui découvre le site sur son téléphone,
I want lire chaque page sans titre géant et trouver vite comment contacter Coralie,
So that je n'abandonne pas avant d'avoir trouvé l'action utile.

**Contexte (mesuré sur `validation` le 2026-11-02, à 390 px) :** le H1 fait
encore 48 px sur l'accueil (180 px de haut, 240 à 320 px), `/coaching`,
`/coaching/particuliers`, `/coaching/etablissements`, GAPP (240 px de haut à
320 px) et les mentions légales. Le premier « Prendre contact » arrive à
5,7 écrans sur `/coaching/particuliers`, 7 sur `/coaching/etablissements`,
5,2 sur GAPP, 5,9 sur le hub Prévention RPS/QVCT et 4,8 sur le hub Cadre
légal ; il est dans le premier écran sur l'accueil et sur les fiches. Aucune
page ne défile horizontalement à 320 px. `/blog` répond 404 en local : à
mesurer sur la Val. Découpage décidé par Cédric (2026-11-02) : audit et H1
dans cette story, déplacements de CTA dans des stories issues du rapport.
Ajouts décidés par Cédric après l'audit (2026-11-02) : le H1 de `/contact`,
encore à 48 px, et l'alignement du haut de page des pages de service sur le
modèle du catalogue `/formations` (fil d'Ariane collé au menu puis 80 px de
blanc avant le H1 sur `/coaching`, ses deux sous-pages, GAPP et les hubs
Famille ; à 320 px, « professionnelles » était coupé dans le H1 de GAPP,
masqué par `overflow-hidden`). Les H1 restent centrés.

**Acceptance Criteria:**

**Given** l'accueil, `/coaching`, `/coaching/particuliers`, `/coaching/etablissements`, GAPP, `/contact` et les mentions légales
**When** on les ouvre à 390 et 320 px
**Then** le H1 est réduit sur smartphone (`text-3xl! sm:text-5xl! lg:text-6xl!`, `break-words`, sans `hyphens-auto`), sans changement de texte, et reste inchangé à partir de `sm`

**Given** `/coaching`, ses deux sous-pages, GAPP et les 4 hubs Famille
**When** on les ouvre
**Then** le haut de page suit le modèle du catalogue : le blanc (`pt-6 sm:pt-20`) précède le fil d'Ariane et le H1 (ou le médaillon des hubs) le suit directement, le premier bloc ne garde que son blanc du bas (`pb-20`) ; le H1 remonte de 56 px sur smartphone, reste à la même hauteur à partir de `sm`, reste centré, et aucun texte ni Hn n'est modifié

**Given** toutes les pages publiques, blog compris (mesuré sur la Val)
**When** on les mesure à 390 et 320 px
**Then** un rapport donne pour chaque page la hauteur du H1, la position de l'action principale en nombre d'écrans, le décor qui repousse le contenu et l'absence de débordement, avec une recommandation par page

**Given** les pages où l'action principale arrive au-delà de 2 écrans
**When** Cédric a arbitré le rapport
**Then** chaque déplacement ou ajout retenu fait l'objet d'une story dédiée ; aucun CTA ni texte n'est ajouté dans cette story

### Story 4.12: Erreurs du formulaire de contact visibles et reliées aux champs

As a visiteur qui remplit le formulaire de contact,
I want voir tout de suite quel champ pose problème et pourquoi,
So that j'envoie ma demande sans rester bloqué devant un bouton désactivé.

**Contexte (constaté en story 4.9, 2026-11-02) :** la validation se fait à
l'envoi (mode par défaut de react-hook-form) et le bouton reste désactivé tant
que le formulaire est invalide : l'envoi n'a jamais lieu, donc aucun message
d'erreur ne s'affiche (RGAA 11.10, WCAG 3.3.1). Le visiteur ne voit que
« Remplissez le formulaire pour envoyer », sans savoir quel champ corriger.
Par ailleurs, le champ e-mail affiche l'erreur de `lastName`, chaque erreur
est rendue deux fois (`FormMessage` et un `span.text-error` sans style), et
les exemples « Jean » / « Dupont » ressemblent à des valeurs déjà saisies.
Story dédiée décidée par Cédric (2026-11-02).

**Acceptance Criteria:**

**Given** un champ invalide (vide, e-mail mal formé, message trop long)
**When** le visiteur quitte le champ ou tente d'envoyer
**Then** un seul message d'erreur, celui du schéma `contactFormSchema` (textes inchangés), s'affiche sous ce champ, relié par `aria-describedby`, avec `aria-invalid="true"` sur le champ, en couleur lisible (≥ 4.5:1 sur le fond ciel) et accompagné d'un repère non coloré (icône ou texte)

**Given** le bouton d'envoi
**When** le formulaire est incomplet
**Then** le visiteur peut comprendre ce qui manque : soit le bouton reste actif et l'envoi déclenche la validation avec le focus placé sur le premier champ en erreur, soit l'état désactivé est conservé et les erreurs apparaissent dès la sortie de chaque champ (choix à arbitrer par Cédric)

**Given** le champ e-mail
**When** il est invalide
**Then** il affiche sa propre erreur, et non celle du nom

**Given** les exemples des champs
**When** le formulaire est vide
**Then** ils ne peuvent pas être pris pour des valeurs saisies (format d'exemple à valider par Cédric)

**Given** l'envoi et le pré-remplissage `?type=&sujet=`
**When** on compare avant et après
**Then** le schéma de validation, l'action serveur `submit_contact_form` et le pré-remplissage sont inchangés

### Story 4.13: Retouches À propos, Contact et fil d'Ariane

As a visiteur qui découvre Coralie,
I want retrouver la phrase clé de sa démarche dans la bulle des slides, et savoir où je suis sur chaque page,
So that le message me parle directement et que je puisse remonter facilement dans le site.

**Contexte (Cédric, 2026-11-02) :** sur `/a-propos`, la phrase « je ne parle
pas de théorie, je parle de votre réalité. » était un gros italique orange
collé à « C'est ce qui fait aujourd'hui ma force : », jugé peu réussi ; deux
maquettes ont été présentées (bulle ciel, manuscrit Kalam) et Cédric a retenu
**la bulle (A)**. Le fil d'Ariane (`Breadcrumbs`, posé page par page avec son
JSON-LD `BreadcrumbList`) manquait sur `/a-propos`, `/contact` et
`/mentions-legales` (mesuré sur `validation` : les 12 autres pages publiques
l'ont). Il reste posé page par page et non dans le layout, car les libellés et
le JSON-LD dépendent de chaque page. Un seul haut de page, propre en SEO et
en code, sur toutes les pages (Cédric, 2026-11-03), celui des hubs depuis la
story 4.11 : le composant `GabaritPage` pose le blanc `pt-6 sm:pt-20` puis le
fil d'Ariane, et le H1 suit directement ; le style du H1 (répété sur 17 H1 en
`text-3xl! sm:text-5xl! lg:text-6xl! break-words`, les `!` contournant une
règle globale hors `@layer`) est défini une seule fois en `@layer base`. La bulle
de la bio et la bulle-question du `CtaElan` sont visibles ensemble à 1280 px :
accepté par Cédric, la règle « une bulle par écran » visant les
bulles-questions.

**Acceptance Criteria:**

**Given** `/a-propos`
**When** on lit la biographie
**Then** « C'est ce qui fait aujourd'hui ma force : » reste en gras sur sa ligne, et la phrase « je ne parle pas de théorie, je parle de votre réalité. » s'affiche dans un `Bubble` (ton ciel, `as="p"`), texte inchangé mot pour mot. Sur smartphone, la bulle tient dans la colonne sans débordement à 320 px

**Given** `/a-propos`, `/contact` et `/mentions-legales`
**When** la page se charge
**Then** un fil d'Ariane « Accueil / À propos », « Accueil / Contact » ou « Accueil / Mentions légales » (libellés du menu) précède le contenu, avec la page courante en `aria-current="page"` et son JSON-LD `BreadcrumbList`

**Given** toutes les pages publiques (`app/**/page.tsx`, hors accueil, `api` et `blog-review`)
**When** les tests tournent
**Then** un test de garde échoue si l'une d'elles n'utilise pas `GabaritPage` ou importe `Breadcrumbs` en direct

**Given** les 17 H1 du site
**When** on lit le code
**Then** leur taille réduite sur smartphone, leur coupure sans césure, leur police et leur graisse viennent de la seule règle `h1` de `app/globals.css`, en `@layer base` ; aucun H1 ne porte de classe de taille ni de `!` (test), et le rendu est identique avant et après (style calculé et position des H1, fil d'Ariane, title, meta, Hn, JSON-LD, `alt`, hauteur des pages, mesurés sur 16 pages à 1280, 390 et 320 px)

**Given** le SEO et la mise en page
**When** on compare avant et après à 1280, 390 et 320 px
**Then** title, meta, H1, Hn, textes, `alt` et URL sont inchangés (seuls ajouts : les fils d'Ariane), le fil d'Ariane et le H1 sont aux mêmes positions que sur les hubs Coaching (même modèle de haut de page, vérifié par test), et la page ne défile pas horizontalement à 320 px

**Given** `EXPERIENCE.md`
**When** on lit la ligne `Bubble`
**Then** son usage couvre aussi « une phrase de Coralie adressée au visiteur » (au plus une par section), sans plus d'une bulle-question par écran
