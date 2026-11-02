# Audit « smartphone d'abord » — story 4.11

Mesuré le 2026-11-02 sur `validation` (6af39d2, avant la story), en local (`next dev`) avec
`BLOG_ENABLED=true`, comme sur la Val et en prod. La Val est derrière un basic
auth Traefik (401) que la session ne peut pas passer. Le drapeau active aussi
le lien « Blog » du menu et les blocs « À lire aussi », qui allongent GAPP et
les hubs Famille de 165 à 325 px par rapport aux mesures faites sans le drapeau.
Chromium/Playwright, fenêtre de 844 px de haut, `getBoundingClientRect` + `scrollY`.
« Écrans » = position du haut de l'élément / 844.

## Synthèse

| Page | H1 (taille, hauteur 390 / 320) | Action principale | 390 px | 320 px |
|---|---|---|---|---|
| Accueil | 48 px — 180 / 240 | Bouton du Hero (ancre vers les axes) | 0,85 | 0,96 (coupé en bas) |
| | | 1er « Prendre contact » | 5,1 | 5,6 |
| `/coaching` | 48 px — 48 / 48 | « Coaching particuliers » | 0,94 | 0,94 |
| `/coaching/particuliers` | 48 px — 96 / 96 | « Prendre contact » | **5,7** | **6,3** |
| `/coaching/etablissements` | 48 px — 144 / 144 | « Prendre contact » | **7,0** | **7,9** |
| GAPP | 48 px — 192 / 240, **tronqué à 320** | « Prendre contact » | **5,4** | **6,1** |
| `/formations` | 30 px — 72 / 72 | 1re « Voir la fiche » | 0,82 | 0,85 |
| Hub Prévention RPS/QVCT | 30 px — 72 / 72 | 1re fiche / « Prendre contact » | 1,1 / **6,3** | 1,3 / **7,0** |
| Hub Cadre légal | 30 px — 72 / 72 | 1re fiche / « Prendre contact » | 1,2 / **4,8** | 1,3 / **5,4** |
| Hub Dynamique d'équipe | 30 px — 108 / 108 | « Prendre contact » (aucune fiche) | **4,9** | **5,3** |
| Hub Accompagnement | 30 px — 108 / 108 | « Prendre contact » (aucune fiche) | **4,9** | **5,4** |
| Fiche Diagnostic QVCT | 30 px — 72 / 72 | « Demander un devis » | 0,54 | 0,60 |
| Fiche Obligations légales | 30 px — 108 / 108 | « Demander un devis » | 0,64 | 0,66 |
| `/a-propos` | 30 px — 72 / 108 | « Prendre contact » | 2,1 | 2,4 |
| `/contact` | **48 px** — 96 / 96 | 1er champ / bouton d'envoi | 0,65 / 1,3 | 0,65 / 1,4 |
| Mentions légales | 48 px — 96 / 96 | — (page de lecture) | — | — |
| `/blog` | 30 px — 36 / 36 | 1er article | 0,39 | 0,41 |
| Article (ex. obligation-securite-rps…) | 30 px — 144 / 180 | aucun lien contact ; « À lire aussi » | 5,4 | 6,3 |

**Débordement horizontal** : `scrollWidth` = largeur de la fenêtre sur toutes
les pages, à 390 et à 320 px. **Mais** à 320 px, le H1 de GAPP déborde de son
conteneur : « professionnell… » est coupé, et le débordement est masqué par
l'`overflow-hidden` de la page (WCAG 1.4.10, contenu perdu). Le H1 réduit de
cette story corrige ce défaut.

## Haut de page : trois modèles

Position du fil d'Ariane et du H1 (px depuis le haut de la fenêtre ; menu
jusqu'à 81 px sur mobile, 93 px sur desktop), avant la story :

| Modèle | Pages | Ariane (390 / 1280) | H1 (390 / 1280) | Blanc Ariane → H1 |
|---|---|---|---|---|
| A — catalogue | `/formations`, fiches, `/blog`, articles | 105 / 173 | 157 / 225 | 0 (24 sur un article) |
| B — pages de service | `/coaching` ×3, GAPP | 81 / 93 (collé au menu) | 213 / 225 | 80 (`py-20` du hero) |
| B avec médaillon | hubs Famille ×4 | 81 / 93 | 333 / 377 | 200 |
| C — sans fil d'Ariane | `/a-propos`, `/contact`, mentions légales | — | 105 / 173 | — |

Décision de Cédric (2026-11-02) : les pages B suivent le modèle A, H1 centrés.

## Après la story 4.11 (mesuré sur la branche)

- H1 à 30 px sur smartphone et 60 px à 1280 px sur l'accueil, `/coaching` ×3,
  GAPP, `/contact` et les mentions légales. Hauteur à 390 / 320 px : accueil
  180 → 75 / 240 → 113 ; `/coaching/etablissements` 144 → 72 ; GAPP
  192 → 108 / 240 → 108 ; `/contact` 96 → 36 / 72 ; mentions légales 96 → 36.
- Haut de page des pages B : fil d'Ariane à 105 px (390) et 173 px (1280),
  comme le catalogue ; H1 à 157 px au lieu de 213 sur smartphone, inchangé à
  225 px à 1280 ; H1 des hubs Famille 333 → 277 (390), 377 inchangé (1280).
- Accueil : bouton du Hero à 612 px (0,73 écran) à 390 px et 680 px (0,81) à
  320 px, entièrement visible dans le premier écran.
- « Prendre contact » remonte de 56 à 190 px, sans changer d'ordre de
  grandeur : 5,5 écrans sur `/coaching/particuliers`, 6,9 sur
  `/coaching/etablissements`, 5,3 sur GAPP, 4,7 à 6,2 sur les hubs Famille
  (390 px). Déplacements renvoyés à des stories dédiées.
- Le H1 de GAPP n'est plus coupé à 320 px ; aucun élément ne dépasse la
  largeur de la fenêtre, aucune page ne défile horizontalement, à 320, 390 et
  1280 px.

## Détail par page

- **Accueil** — Décor avant le H1 : logo animé (moitié de la largeur, ~170 px,
  + `mb-10`) et badge. À 320 px, le bouton du Hero est coupé en bas du premier
  écran. *Reco* : H1 réduit (cette story) ; il remonte le bouton d'environ
  90 px. Logo laissé à la moitié de la largeur (règle déjà fixée).
- **`/coaching`** — Hero `py-20` (80 px de blanc au-dessus du H1), cartes en
  `p-10` avec médaillons de 160 px : le 2e bouton arrive à 1,5 écran. *Reco* :
  H1 réduit ; hero en `pt-6 sm:pt-20` et médaillons réduits sur smartphone
  (story « décor »).
- **`/coaching/particuliers`, `/coaching/etablissements`, GAPP** — Même hero
  `py-20` ; ensuite 4 à 6 sections h2 (bandeaux, cartes, étapes) avant le seul
  « Prendre contact », en fin de page. *Reco* : H1 réduit ; action de contact
  tôt (après l'introduction du hero, sur le modèle de « Demander un devis » des
  fiches) — story dédiée.
- **Hubs Famille** — Médaillon de 96 px au-dessus du H1 ; les fiches arrivent
  vers 1,2 écran, le contact entre 4,8 et 7 écrans ; Dynamique d'équipe et
  Accompagnement n'ont pas de fiche, leur seule action est à ~5 écrans.
  *Reco* : action de contact tôt (même story que ci-dessus).
- **`/formations`, fiches, `/blog`** — Conformes (action dans le premier écran).
- **`/a-propos`** — 2,1 à 2,4 écrans, juste au-delà du seuil ; le lien
  « coaching individuel » arrive à 1,2 écran. *Reco* : rien pour l'instant.
- **`/contact`** — H1 encore à 48 px (hors de la liste de la story). Formulaire
  dans le premier écran. *Reco* : H1 réduit (à arbitrer : dans cette story ?).
- **Mentions légales** — H1 réduit (cette story) ; rien d'autre.
- **Article de blog** — Aucun lien vers le contact ; les liens « À lire aussi »
  arrivent après 5 écrans. *Reco* : à arbitrer (le gabarit d'article est hors
  pipeline, mais un CTA d'article est un ajout de texte).
