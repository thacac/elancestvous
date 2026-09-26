---
title: Refonte architecture Formations / Coaching / GAPP — elancestvous.fr
status: final
created: 2026-09-25
updated: 2026-09-26
---

# PRD : Refonte architecture Formations / Coaching / GAPP — elancestvous.fr
*Working title — confirmer.*

## 0. Document Purpose

Ce PRD couvre la restructuration de l'information architecture, des URLs et du
catalogue de formations du site vitrine d'Élan C'est Vous (Coralie Mathorel,
coach santé au travail, Toulouse). Il sert de base à `bmad-architecture` puis
`bmad-create-epics-and-stories`. Il s'appuie sur :
- une session de party-mode (agents Mary/John/Sally/Winston/Amelia) qui a
  tranché la nav, les URLs, le modèle de contenu et la rotation blog ;
- un run `bmad-ux` antérieur, resté `draft` et abandonné après deux essais de
  direction visuelle non concluants (bento SaaS puis éditorial noir & blanc) ;
- des maquettes Design Artifact fonctionnelles (registre "flat design, tuiles
  blanches à trait fin") validées itérativement dans cette même session, qui
  remplacent de fait le run `bmad-ux` `draft` comme référence visuelle.

Rédigé en Fast path : distillé directement depuis la session, `[ASSUMPTION]`
uniquement sur les vrais trous.

## 1. Vision

Le site actuel présente trois offres (Formations, Coaching, GAPP) chacune sur
une page isolée, avec un maillage interne quasi inexistant (constat déjà posé
dans `docs/seo-audit-pages-existantes.md`). Cette refonte réorganise le site
autour de 3 piliers d'offre clairs en nav racine, introduit un vrai catalogue
de formations structuré et conforme Qualiopi (condition de financement OPCO
pour les établissements clients), et ajoute un traitement éditorial et
juridique des obligations légales des établissements — sans jamais perdre le
contenu marketing déjà écrit ni la structure d'URL SEO qui a le plus de valeur
(anti thin-page).

## 2. Target User

### 2.1 Jobs To Be Done

- En tant que **référent QVCT / RH / direction d'établissement de santé**, je
  dois trouver rapidement une formation finançable (Qualiopi) et comprendre
  son format, sa durée et son tarif avant de demander un devis.
- En tant que **direction d'établissement inquiète d'un risque juridique**
  (RPS, obligation de sécurité), je dois comprendre ce qui est exigé de moi et
  trouver un accompagnement pour agir avant le contentieux.
- En tant que **cadre de santé ou manager de proximité**, je dois pouvoir
  comparer plusieurs formations d'un même thème (QVCT, RPS...) avant de
  choisir.
- En tant que **particulier**, je dois pouvoir trouver l'accompagnement
  individuel sans naviguer dans le contenu établissement (parcours existant,
  non modifié par ce PRD).

### 2.2 Non-Users (v1)

- Recherche d'emploi / recrutement (pas une plateforme RH).
- Achat/paiement en ligne d'une formation — le parcours reste "demander un
  devis", pas de tunnel de paiement.

### 2.3 Key User Journeys

- **UJ-1. Amandine cherche une formation QVCT finançable pour son équipe
  d'encadrement.**
  Amandine, référente QVCT dans un établissement de santé toulousain, tape
  "formation QVCT établissement de santé" sur Google. Elle arrive sur
  `/formations/qvct`, reconnaît immédiatement le ton du site (contenu
  pédagogie/public cible déjà familier), voit en premier la section
  "Formations QVCT disponibles" — pas noyée en bas de page — compare deux
  fiches, ouvre "Diagnostic et plan d'action QVCT", vérifie durée/tarif/
  accessibilité dans la fiche pratique, clique "Demander un devis".
  **Edge case** : si aucune formation du thème n'est encore publiée, la
  section affiche un état vide honnête plutôt qu'une liste tronquée.

- **UJ-2. Marc, directeur d'établissement, découvre son obligation de
  sécurité après un article de blog.**
  Marc lit un article de blog sur les signaux d'alerte RPS (maillage retour
  existant), clique sur le lien "en savoir plus sur vos obligations", atterrit
  sur `/formations/obligations-legales-etablissements`, comprend qu'un DUERP
  mal tenu est un risque juridique réel, et demande un devis pour la
  formation associée. Réalise UJ-2.

- **UJ-3. Sophie compare plusieurs formations avant de choisir.**
  Sophie ouvre `/formations` (catalogue), clique le filtre "Obligations
  légales" (pastille cliquable), compare "Obligations légales des
  établissements" et "DUERP en pratique", ouvre les deux fiches dans des
  onglets, tranche sur le format.

## 3. Glossary

- **Pilier** — Catégorie de rotation du contenu blog (`services/blog/pillars.ts`) :
  Coaching individuel, Coaching établissement, Formations, GAPP, Obligations
  légales (nouveau, id `F`). Détermine le poids de publication et la cible du
  maillage retour blog → page. Distinct de "pilier de navigation".
- **Thème** — Sujet du catalogue de formations (QVCT, RPS, Gestion du stress
  et des émotions, Obligations légales des établissements). Un thème peut
  contenir plusieurs Fiches formation.
- **Fiche formation** — Page individuelle d'une formation concrète, avec les
  champs Qualiopi obligatoires (objectifs, prérequis, public, durée,
  modalités/délais d'accès, tarif, évaluation, accessibilité, indicateurs de
  résultats). Rattachée à exactement un Pilier.
- **Hub** — Page qui conserve le contenu marketing actuel d'une offre et
  distribue vers ses Fiches formation ou sous-pages. Trois hubs : Formations
  (= aussi le Catalogue), Coaching, et un hub par Thème (ex. `/formations/qvct`).
- **Catalogue** — Le hub Formations (`/formations`) dans son rôle de liste
  filtrable de toutes les Fiches formation, tous Thèmes confondus.
- **Groupe sémantique** — Regroupement des liens vers les Thèmes dans un hub :
  "Prévention & bien-être au travail" (QVCT, RPS, Gestion du stress et des
  émotions) vs "Cadre légal" (Obligations légales).
- **Maillage retour** — Lien automatique d'un article de blog vers la page
  service ciblée par son Pilier, via `ArticlesBlogLiesBloc` (existant, inchangé
  dans son mécanisme — seule sa cible change : les Hubs Thème plutôt que
  l'ancienne page unique).

## 4. Features

### 4.1 Navigation racine à 3 piliers

**Description :** La nav passe de sa structure actuelle (mélange
audience/thème) à 3 entrées claires : Formations, Coaching, GAPP. Les
Obligations légales ne sont *pas* une 4e entrée — elles vivent comme Thème
dans le Catalogue Formations. GAPP reste toujours une entrée à part, jamais
niché sous Formations (ce n'est pas une formation, c'est une offre au format
différent — pas de champs Qualiopi, pas de programme pédagogique).
`[ASSUMPTION: le bouton "Particuliers" du header actuel peut coexister avec
l'entrée Coaching plutôt que d'être supprimé — aucune décision explicite prise
sur son sort, sujet resté ouvert en party-mode.]`

**Functional Requirements:**

#### FR-1: Nav à 3 entrées racine
Un visiteur peut naviguer depuis n'importe quelle page vers Formations,
Coaching ou GAPP via la nav principale.

**Consequences (testable):**
- La nav ne contient aucune entrée "Obligations légales" de premier niveau.
- GAPP reste un lien direct, jamais un sous-élément de Formations.

### 4.2 URLs cibles et redirections

**Description :** Nouveau schéma d'URL, propre et court, qui remplace le
schéma actuel préfixé par audience (`particuliers/`,
`professionnels-etablissements-de-soins/`). Aucune des URLs actuelles n'a de
trafic organique réel à ce jour (confirmé par l'utilisateur), donc le coût de
migration est nul — mais des redirections 301 restent mises en place par
bonne pratique (liens déjà partagés, bots, cohérence).

**Functional Requirements:**

#### FR-2: Nouveau schéma d'URL
Le site expose les URLs suivantes :
- `/formations` (hub + catalogue), `/formations/qvct`, `/formations/rps`,
  `/formations/gestion-stress-emotions`,
  `/formations/obligations-legales-etablissements`
- `/coaching`, `/coaching/particuliers`, `/coaching/etablissements`
- `/gapp-analyse-pratiques-professionnelles`

**Consequences (testable):**
- Chaque ancienne URL de service (`particuliers/coaching-individuel`,
  `professionnels-etablissements-de-soins/{coaching,formations-rps-qvct,
  gapp-groupe-analyse-pratiques-professionnelles}`) répond en 301 vers sa
  nouvelle URL.
- Les préfixes `particuliers/` et `professionnels-etablissements-de-soins/`
  ne servent plus aucune page une fois la migration terminée.

**Out of Scope:** Renommage des URLs de blog, du `/a-propos`, `/contact`.

### 4.3 Catalogue de formations structuré (Qualiopi)

**Description :** Le catalogue de formations vit en contenu structuré,
analogue à `content/blog/*.md` (schéma zod). Chaque Fiche formation est
rattachée à un Pilier (`pillar` obligatoire) — plusieurs fiches peuvent
partager un même Thème (pas de correspondance 1 Thème = 1 Fiche). Chaque
fiche expose les champs exigés par Qualiopi. Aucune donnée factuelle
(tarif, durée exacte, taux de satisfaction, nom du référent handicap)
n'est inventée : placeholder explicite tant que la donnée réelle n'est pas
fournie par la cliente.

**Functional Requirements:**

#### FR-3: Modèle de contenu formation
Le système lit des fichiers `content/formations/<slug>.md` avec frontmatter
validé par un schéma zod incluant au minimum : titre, thème/pilier, objectifs
pédagogiques, prérequis, public visé, programme, durée, format, délai
d'accès, tarif, modalités d'évaluation, accessibilité + référent handicap,
indicateurs de résultats.

**Consequences (testable):**
- Un fichier formation sans `pillar` valide échoue à la validation de build.
- Les champs Qualiopi absents affichent un placeholder visuellement distinct
  (jamais une valeur inventée), cohérent avec le comportement déjà admis sur
  les maquettes (`[À confirmer]`, `[à renseigner]`).

#### FR-4: Catalogue filtrable par catégorie
Le hub `/formations` liste toutes les Fiches formation, tous Thèmes
confondus, avec des pastilles de catégorie cliquables (QVCT, RPS, Gestion du
stress et des émotions, Obligations légales, Toutes) qui filtrent la liste.

**Consequences (testable):**
- Cliquer une pastille de catégorie ne montre que les fiches de ce Thème ; la
  pastille "Toutes" restaure la liste complète.
- Chaque fiche affiche sa pastille de catégorie, sa durée, et un lien "Voir
  la fiche" stylé comme un vrai bouton (pas un lien texte nu — cf. 4.7).

#### FR-5: Fiche formation individuelle
Chaque Fiche formation a sa propre page, avec colonne de contenu (objectifs,
programme, public visé, modalités) et fiche pratique Qualiopi en sidebar
(desktop) avec CTA primaire "Demander un devis".

**Consequences (testable):**
- La fiche pratique reste visible pendant le défilement de la colonne de
  contenu sur desktop (`position: sticky`).
- Le CTA "Demander un devis" est un bouton plein, jamais un lien texte.

### 4.4 Pilier "Obligations légales" dans la rotation blog

**Description :** `services/blog/pillars.ts` gagne un 5e `PillarId`, valeur
`"F"` (pas `"E"`, déjà réservé de façon informelle à l'angle SEO local
transversal dans la documentation existante — collision de sens à éviter).
Poids de rotation aligné à 4, comme le pilier Formations existant — jamais
au-dessus, puisque les obligations légales restent un sous-thème de
Formations plutôt qu'une catégorie parente.

**Functional Requirements:**

#### FR-6: Nouveau pilier de rotation blog
Le système ajoute un pilier `F` ("Obligations légales") à `PILLARS`, poids 4,
`targetPage` pointant vers `/formations/obligations-legales-etablissements`.

**Consequences (testable):**
- `pickNextPillar` peut désormais sélectionner ce pilier.
- Le maillage retour (`getRelatedArticleLinks`) fonctionne pour ce pilier sans
  code spécifique supplémentaire (mécanisme déjà générique par pilier).

**Out of Scope:** Réajustement des poids des piliers Coaching (2/2) et GAPP
(3) — `[ASSUMPTION: inchangés, non revisités cette session.]`

### 4.5 Pages hub (contenu conservé + maillage)

**Description :** Chaque hub (Formations, Coaching, et chaque hub Thème sous
Formations) conserve intégralement le contenu marketing déjà écrit et validé
de la page actuelle correspondante — jamais remplacé par une simple liste de
liens (risque de "thin page" identifié par l'agent Mary en party-mode). Un
hub Thème ajoute une section "Formations disponibles" **remontée en premier**,
avant le contenu de réassurance (pédagogie, public cible) — décision prise
suite au constat que les formations, placées en bas de page sans signal
visuel fort, ne convertissaient pas. Chaque hub Thème affiche aussi les
articles de blog liés (mécanisme `ArticlesBlogLiesBloc` existant, inchangé
techniquement — seule sa cible évolue) et le lien vers les autres
accompagnements (`ArticulationBloc` existant).

**Functional Requirements:**

#### FR-7: Contenu marketing conservé sur chaque hub
Le contenu actuel de `formations-rps-qvct/page.tsx`, `coaching/page.tsx`,
`coaching-individuel/page.tsx` et de la page GAPP est repris intégralement
sur les nouvelles URLs, sans perte de section.

**Consequences (testable):**
- Chaque hub conserve son nombre de sections de contenu marketing d'origine
  (aucune section supprimée par la migration).

#### FR-8: Section "Formations disponibles" en tête de hub Thème
Sur un hub Thème, la liste des Fiches formation de ce Thème apparaît comme
premier bloc de la colonne de contenu, avant tout contenu de réassurance.

**Consequences (testable):**
- Aucun contenu de réassurance (pédagogie, public cible) ne précède la
  section "Formations disponibles" dans l'ordre du DOM.

#### FR-9: Liens groupés par groupe sémantique
Le hub Formations ajoute, en plus de son contenu conservé, une section de
liens vers les Thèmes groupés en "Prévention & bien-être au travail" (QVCT,
RPS, Gestion du stress et des émotions) et "Cadre légal" (Obligations
légales) — jamais une liste plate des 4 Thèmes.

#### FR-10: Articles de blog liés sur chaque hub Thème
Chaque hub Thème affiche jusqu'à 3 articles de blog récents rattachés à son
Pilier via `ArticlesBlogLiesBloc`, en colonne latérale sticky à partir du
breakpoint `lg`, empilée en pleine largeur en dessous du contenu principal
en dessous de `lg`.

**Consequences (testable):**
- La cible (`targetPage`) du Pilier correspondant pointe vers l'URL du hub
  Thème, pas vers une Fiche formation individuelle.

### 4.6 Home refondue (tuiles piliers)

**Description :** Le Hero reste inchangé (fond pastel, logo, CTA "Solutions
pour les établissements", callout particulier). La section piliers passe
d'une grille de 3 cartes génériques à 3 tuiles blanches à trait fin, chacune
avec une icône illustrée maison en aplat (pas de photo — aucun asset photo
distinct par pilier disponible), propre à Formations (teal), Coaching (navy),
GAPP (corail) : livre stylisé, duo de silhouettes, cercle de points pleins
("jamais de chaise vide", cohérent avec la consigne déjà écrite dans
`pillars.ts` pour les illustrations de blog GAPP).

**Functional Requirements:**

#### FR-11: Section piliers en tuiles
La home affiche 3 tuiles (Formations, Coaching, GAPP) de poids visuel
comparable — aucune ne domine les deux autres par sa taille ou sa position.

**Consequences (testable):**
- Les 3 tuiles ont la même hauteur et largeur dans la grille desktop.

### 4.7 CTA cohérents et visibles (design system boutons)

**Description :** Un seul système de bouton secondaire réutilisé sur toutes
les surfaces de découverte (tuiles home, cartes catalogue, cartes hub Thème) :
contour + fond légèrement teinté, jamais un simple lien texte nu, jamais un
pill plein façon SaaS (registre déjà rejeté deux fois cette session).
Cohérent avec le vrai bouton du site (`components/ui/button.tsx` :
`rounded-md`, `shadow-sm`, pas de `rounded-full`).

**Functional Requirements:**

#### FR-12: Bouton secondaire visible et cohérent
Tout CTA "Découvrir" / "Voir la fiche" est un élément bouton avec contour et
fond teinté, jamais un lien texte seul, réutilisé identiquement sur home,
catalogue et hub.

**Consequences (testable):**
- Le contraste du texte du bouton respecte au moins 4.5:1 sur son fond, y
  compris sur la tuile Coaching (fond navy).

**Feature-specific NFRs:**
- Toutes les valeurs de police, radius et espacement des composants ajoutés
  correspondent à l'échelle Tailwind par défaut (pas de valeur arbitraire hors
  échelle, vérifié explicitement cette session).

## 5. Non-Goals (Explicit)

- Pas de tunnel de paiement / réservation en ligne — le parcours reste
  "demander un devis" pour toute formation.
- Pas de refonte du contenu des pages Coaching existantes — contenu conservé
  tel quel, seule l'URL et le point d'entrée changent.
- Pas d'obtention de la certification Qualiopi elle-même — ce PRD couvre la
  structure "prête pour Qualiopi", pas la démarche de certification.
- Pas de renommage des URLs de blog, `/a-propos`, `/contact`, `/mentions-legales`.
- Pas de nouvelle génération d'images/photos par IA (pas d'outil de
  génération d'image disponible dans les sessions qui ont produit ce PRD).

## 6. MVP Scope

### 6.1 In Scope
- Nav à 3 piliers, nouveau schéma d'URL + redirections 301.
- Modèle de contenu formation structuré + validation zod.
- Catalogue filtrable, fiches formation avec champs Qualiopi (placeholders
  pour les données réelles manquantes).
- Nouveau pilier blog "Obligations légales" (id `F`, poids 4) et maillage
  retour vers les hubs Thème.
- Refonte home (tuiles piliers) et hubs (contenu conservé + formations
  remontées + articles liés).
- Design system CTA secondaire unifié.

### 6.2 Out of Scope for MVP
- Contenu réel de chaque Fiche formation au-delà d'1 exemple par Thème déjà
  esquissé en maquette (Diagnostic QVCT, Obligations légales des
  établissements) — rédaction du reste du catalogue déférée à un chantier de
  contenu séparé. `[NOTE FOR PM: charge de rédaction non chiffrée dans cette
  session.]`
- Vraies données Qualiopi (tarifs, dates de session, taux de satisfaction,
  référent handicap) — placeholders jusqu'à fourniture par la cliente.
- Photos distinctes par pilier — illustration plate maison en attendant.

## 7. Success Metrics

*Site jeune, aucune donnée Search Console citée cette session — métriques
qualitatives pour ce PRD, à chiffrer une fois une baseline GSC disponible.*
`[ASSUMPTION]`

**Primary**
- **SM-1**: Une Fiche formation qui répond au Thème recherché est atteignable
  en 2 clics maximum depuis la home. Valide FR-1, FR-4, FR-8.
- **SM-2**: Le CTA "Demander un devis" est repérable au premier coup d'œil
  sur toute Fiche formation (test utilisateur informel, pas de heatmap
  disponible). Valide FR-5, FR-12.

**Secondary**
- **SM-3**: Chaque hub Thème publié génère au moins un maillage retour actif
  (au moins un article de blog le cible) dans les 3 mois suivant sa mise en
  ligne. Valide FR-10.

**Counter-metrics (do not optimize)**
- **SM-C1**: Le nombre de sections de contenu marketing par hub ne doit pas
  diminuer pour gagner en "légèreté" perçue — contrebalance SM-1 (un parcours
  plus court ne doit pas se faire en sacrifiant le contenu qui retient le
  trafic organique générique).

## 8. Open Questions

1. Le bouton "Particuliers" du header actuel est-il conservé tel quel une
   fois le hub Coaching en place, ou retiré au profit de l'entrée Coaching
   seule ? Non tranché en party-mode.
2. Mécanisme technique des redirections 301 (`next.config.js` `redirects()`
   vs middleware) — à trancher en architecture.
3. Combien de Fiches formation par Thème sont réellement prêtes à être
   rédigées pour le lancement MVP, et par qui ?
4. Le module de filtrage du catalogue (FR-4) doit-il être client-side pur ou
   supporter un lien partageable par catégorie (`?categorie=qvct`) ? Non
   discuté cette session.

## 9. Assumptions Index

- §0 — Les maquettes Design Artifact de cette session remplacent le run
  `bmad-ux` `draft` comme référence visuelle ; ce dernier reste non finalisé.
- §4.1 — Le bouton "Particuliers" du header peut coexister avec l'entrée
  Coaching (cf. Open Question 1).
- §4.4 — Poids de rotation Coaching (2/2) et GAPP (3) inchangés.
- §6.2 — Charge de rédaction du reste du catalogue non chiffrée.
- §7 — Success Metrics qualitatives faute de baseline Search Console.
