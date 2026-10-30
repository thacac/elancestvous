---
name: Élan C'est Vous — charte slides
description: Identité visuelle d'elancestvous.fr inspirée des slides de formation (bandeaux pétrole, orange, cartes pastel, bulles). Tailwind CSS v4 sur Next.js ; ce document fixe la couche de marque au-dessus des valeurs par défaut de Tailwind.
status: final
updated: 2026-10-30
sources:
  - .memlog.md
  - ../../prds/prd-elancestvous-2026-09-25/prd.md
  - app/globals.css
  - app/fonts.ts
  - components/charte/
colors:
  # Socle conservé
  primary: '#112e40'          # bleu nuit — texte principal, titres
  logo: '#29b5ad'             # turquoise du logo
  # Charte slides
  petrol: '#0f4c5c'           # bandeaux de section, pastilles, pied de page
  teal-soft: '#c6e8ec'        # vagues, sous-titres sur pétrole
  orange: '#f28a1e'           # décor uniquement (pinceau, étincelles, flèches, barres)
  accent: '#d9680a'           # fonds et grands textes orange (blanc dessus ≈ 3.5:1, texte large seulement)
  accent-ink: '#a64d08'       # texte orange courant, fonds de boutons orange (blanc dessus ≈ 5.7:1)
  sky: '#e6f4f8'              # fond pastel ciel
  peach: '#fdefe2'            # fond pastel pêche
  sage: '#e9f4e7'             # fond pastel vert d'eau
  sage-ink: '#3f7a3a'         # pastille verte (blanc dessus ≥ 4.5:1)
  lilac: '#efecf9'            # fond pastel lilas
  white: '#ffffff'
typography:
  display:
    fontFamily: 'Nunito'
    fontWeight: '900'
    lineHeight: '1.1'
  display-italic:
    fontFamily: 'Nunito'
    fontWeight: '800'
    note: 'italique, pour le mot mis en avant dans un titre'
  body:
    fontFamily: 'Nunito Sans'
    fontWeight: '400'
    lineHeight: '1.6'
  hand:
    fontFamily: 'Kalam'
    fontWeight: '400'
    note: 'sous-titres de bandeau et petites annotations uniquement'
rounded:
  # Échelle Tailwind par défaut (NFR1 de la PRD : aucune valeur arbitraire).
  md: 6px           # boutons (rounded-md, inchangé)
  '3xl': 24px       # cartes pastel, étapes, message clé
  full: 9999px      # pastilles-étiquettes et numéros d'étapes, jamais des boutons
spacing:
  # Échelle Tailwind par défaut, sans surcharge.
components:
  section-banner:
    background: '{colors.petrol}'
    title: '{typography.display}'
    title-color: '{colors.white}'
    subtitle: '{typography.hand}'
    subtitle-color: '{colors.teal-soft}'
    separator: '{colors.orange}'
  pastel-card:
    background: '{colors.sky} | {colors.peach} | {colors.sage} | {colors.lilac}'
    radius: '{rounded.3xl}'
  chip:
    background: '{colors.petrol} | {colors.accent-ink} | {colors.sage-ink}'
    foreground: '{colors.white}'
    radius: '{rounded.full}'
  key-message:
    background: '{colors.sky}'
    text: '{typography.display}'
    icon-color: '{colors.petrol}'
    separator: '{colors.orange}'
  step-badge:
    background: '{colors.accent-ink} | {colors.petrol} | {colors.sage-ink} | {colors.primary}'
    foreground: '{colors.white}'
    radius: '{rounded.full}'
  bubble:
    background: '{colors.sky}'
    text: '{typography.display}'
  button-accent:
    background: '{colors.accent-ink}'
    foreground: '{colors.white}'
    radius: '{rounded.md}'
  footer:
    background: '{colors.petrol}'
    foreground: '{colors.white}'
  logo:
    circle: '{colors.logo}'
    letter: '{colors.white}'
    dot: '{colors.orange}'
    sparkles: '{colors.orange}'
---

## Brand & Style

Élan C'est Vous accompagne les soignants et les établissements de santé : prévenir l'épuisement, réguler la charge émotionnelle, faire vivre des pratiques durables. Le site reprend l'expérience des nouvelles slides de formation : on doit s'y sentir comme dans une salle de formation bienveillante, où l'on vous pose des questions plutôt que de vous vendre quelque chose.

La posture est chaleureuse, claire et pédagogique. Elle évite le registre SaaS (bento, pills, gradients) et le registre éditorial austère, tous deux déjà rejetés (voir `.memlog.md`). La signature visuelle tient en quelques gestes répétés : le bandeau pétrole en vague, la barre orange, les fonds pastel qui alternent, la bulle-question et une touche manuscrite.

Le référencement passe avant la décoration. La charte habille le contenu existant sans toucher aux titres, aux textes ni aux URLs.

## Colors

- **Bleu nuit `{colors.primary}`** : texte principal et titres sur fond clair. Inchangé depuis la charte précédente.
- **Turquoise `{colors.logo}`** : cercle du logo. Jamais utilisé pour du texte sur blanc (≈ 2.4:1).
- **Pétrole `{colors.petrol}`** : bandeaux de section, pastilles de titre, pied de page. Le texte posé dessus est blanc ou `{colors.teal-soft}`.
- **Orange, en trois rôles distincts :**
  - `{colors.orange}` est **décoratif uniquement** : trait de pinceau, étincelles, flèches entre étapes, barres verticales. Jamais de texte en orange vif.
  - `{colors.accent}` sert aux fonds et aux très grands textes, à partir de 24 px ou 18,66 px en gras. Exemples : bandeau CTA, mot mis en avant dans un H1.
  - `{colors.accent-ink}` sert au texte orange de taille courante et au fond des boutons orange, toujours avec un texte blanc.
- **Pastels `{colors.sky}`, `{colors.peach}`, `{colors.sage}`, `{colors.lilac}`** : fonds de cartes qui alternent dans une même rangée, comme dans les slides. Le texte posé dessus est `{colors.primary}`.
- Les couleurs de catégorie du catalogue (`cat-*` dans `globals.css`) restent en place pour les pastilles de famille.

À éviter : un texte orange vif ; un texte turquoise sur blanc ; plus de deux pastels différents dans un même bloc de deux cartes ; tout dégradé.

## Typography

- **Titres** : `{typography.display}` (Nunito 900), avec `text-wrap: balance`. Le mot mis en avant dans un titre passe en `{typography.display-italic}`, coloré en `{colors.accent}`.
- **Texte courant** : `{typography.body}` (Nunito Sans). Il porte toutes les pages longues, blog compris.
- **Annotations** : `{typography.hand}` (Kalam), réservée aux sous-titres de bandeau et aux petites notes. Elle ne sert jamais pour un paragraphe ni pour un titre.
- Les polices sont auto-hébergées via `next/font` (`app/fonts.ts`) en `display: swap`. Kalam n'est pas préchargée, car elle est décorative.

## Layout & Spacing

On utilise l'échelle d'espacement par défaut de Tailwind, sans surcharge. Les conteneurs restent ceux du site (`.container`, `.wide`). Les rangées de cartes et d'étapes passent de 4 colonnes à 2 puis à 1 sur mobile. Les flèches entre étapes ne s'affichent qu'à partir de `lg`. Une section suit le rythme des slides : un bandeau, le contenu en cartes, puis éventuellement un message clé.

## Elevation & Depth

La profondeur vient des aplats de couleur, pas des ombres. Les cartes pastel n'ont ni ombre ni bordure. Les ombres existantes des boutons (`shadow-sm`) restent inchangées.

## Shapes

On reste sur l'échelle Tailwind par défaut (NFR1). Les boutons gardent `{rounded.md}`. Les cartes, étapes et messages clés prennent `{rounded.3xl}`. La forme `{rounded.full}` est réservée aux pastilles-étiquettes et aux numéros d'étapes : un élément entièrement arrondi n'est jamais un bouton. Le style « pill » a été rejeté deux fois pour les boutons (PRD §4.7).

## Components

Tous ces composants se trouvent dans `components/charte/`. Leur comportement est décrit dans `EXPERIENCE.md`.

- **Bandeau de section (`SectionBanner`)** : aplat `{colors.petrol}` plein derrière le texte, prolongé d'une vague dessinée en dessous. Contenu : une icône au trait blanche, une barre `{colors.orange}`, un titre blanc et un sous-titre manuscrit `{colors.teal-soft}`. Le texte ne repose jamais sur la vague.
- **Carte pastel (`PastelCard`)** et **pastille (`Chip`)** : fond pastel en `{rounded.3xl}`. La pastille de titre est blanche sur `{colors.petrol}`, `{colors.accent-ink}` ou `{colors.sage-ink}`.
- **Message clé (`KeyMessage`)** : fond `{colors.sky}` avec une ampoule pétrole aux rayons orange, une barre orange et une phrase en Nunito extra-gras. Au maximum un par section.
- **Étapes (`Steps`)** : cartes ciel et pêche en alternance, numéro dans un cercle (`{colors.accent-ink}`, `{colors.petrol}`, `{colors.sage-ink}`, `{colors.primary}`), flèches orange entre les cartes.
- **Bulle (`Bubble`)** : nuage `{colors.sky}` avec deux petites bulles de queue, texte en Nunito 900.
- **Décor (`Wave`, `Sparkle`, `BrushUnderline`)** : uniquement en `{colors.orange}`, `{colors.petrol}` et `{colors.teal-soft}`.
- **Logo (`Logo`)** : cercle `{colors.logo}`, lettre blanche, point `{colors.orange}`. La variante avec étincelles est réservée aux grands formats (accueil, supports). Fichiers source : `public/logo_elancestvous.svg` et `public/logo_elancestvous_etincelles.svg`.
- **Bouton orange** (variante `accent` de `components/ui/button.tsx`) : fond `{colors.accent-ink}`, texte blanc, `{rounded.md}`. Le bouton secondaire teinté (FR12) est inchangé.
- **Pied de page** : fond `{colors.petrol}`, liens blancs, mentions en `{colors.teal-soft}`.

Les maquettes de référence sont la proposition de charte (https://claude.ai/artifact/T8zuRxkaB6sh87BtkJmUv2) et la planche logo (https://claude.ai/artifact/Vew5ADwHUXiV9msQJbV7Mx). En cas de conflit, ce document l'emporte.

## Do's and Don'ts

| À faire | À éviter |
|---|---|
| Un bandeau pétrole par section, avec un vrai titre Hn | Des titres centrés sans bandeau à côté de sections déjà restylées |
| Alterner les pastels dans une rangée de cartes | Une rangée de cartes toutes grises ou toutes de la même teinte |
| Orange vif pour le décor, `accent-ink` pour le texte et les boutons | Du texte ou un bouton blanc sur orange vif |
| 1 ou 2 touches manuscrites ou étincelles par écran | Kalam pour des paragraphes ; des étincelles partout |
| Étapes numérotées pour une vraie démarche ordonnée | Des numéros sur une simple liste de points |
| Échelle Tailwind par défaut (NFR1) | Des valeurs arbitraires `-[…]` (dette connue : la forme de `Bubble`) |
| Garder titres, textes et URLs existants | Modifier du contenu indexé pour « faire rentrer » un design |
