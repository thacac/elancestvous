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
  # 8 couleurs, un rôle chacune (palette resserrée, validée le 2026-10-30).
  # Valeurs mesurées dans le PDF des slides ; contrastes calculés (formule WCAG).
  primary: '#0a0c44'          # bleu nuit indigo — texte et titres (18:1 sur blanc)
  petrol: '#015566'           # bandeaux, pied de page, pastilles (blanc dessus 8.4:1)
  cyan: '#01a4b8'             # turquoise vif — courbes et vagues uniquement (décor)
  logo: '#29b5ad'             # turquoise du logo — logo uniquement
  orange: '#f28a1e'           # orange vif — décor uniquement (pinceau, étincelles, flèches, barres)
  accent: '#a64d08'           # orange foncé — texte orange et fonds de boutons (blanc dessus 5.7:1, 5:1 sur pastels)
  sky: '#dff7fa'              # pastel ciel — cartes ; texte clair sur pétrole (7.5:1)
  peach: '#fdefe2'            # pastel pêche — cartes, en alternance avec le ciel
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
    subtitle-color: '{colors.sky}'
    separator: '{colors.orange}'
  pastel-card:
    background: '{colors.sky} | {colors.peach}'
    radius: '{rounded.3xl}'
  chip:
    background: '{colors.petrol} | {colors.accent}'
    foreground: '{colors.white}'
    radius: '{rounded.full}'
  key-message:
    background: '{colors.sky}'
    text: '{typography.display}'
    icon-color: '{colors.petrol}'
    separator: '{colors.orange}'
  step-badge:
    background: '{colors.accent} | {colors.petrol} | {colors.primary}'
    foreground: '{colors.white}'
    radius: '{rounded.full}'
  bubble:
    background: '{colors.sky} | {colors.white}'
    text: '{typography.display}'
  button-accent:
    background: '{colors.accent}'
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

Deux règles fixées par Cédric le 2026-10-31 complètent ce principe :

- **Le SEO, c'est d'abord le contenu.** On peut ajouter un titre ou un texte utile : un vrai Hn qui décrit sa section, comme le bandeau « Toutes nos formations » du catalogue. On ne modifie et on ne retire jamais un titre, un texte indexé ou une URL existants.
- **L'interface d'abord, efficace sur smartphone.** On conçoit d'abord pour une seule colonne. L'ordre de lecture sur mobile place l'action principale tôt : sur une fiche formation, la fiche pratique et « Demander un devis » viennent juste après l'introduction, pas en fin de page. Le décor (médaillons, flèches) se réduit ou s'efface sur petit écran plutôt que de repousser le contenu.

## Colors

La palette compte **8 couleurs, chacune avec un rôle unique**. Les valeurs ont été mesurées dans le PDF des slides et chaque contraste est calculé selon la formule WCAG (voir la règle « Accessibilité » de `CLAUDE.md`, RGAA 4.1 / WCAG 2.2 AA).

- **Bleu nuit `{colors.primary}`** : texte et titres. 18:1 sur blanc, plus de 16:1 sur les pastels.
- **Pétrole `{colors.petrol}`** : bandeaux de section, pastilles, pied de page. Le texte posé dessus est blanc (8.4:1) ou `{colors.sky}` (7.5:1).
- **Turquoise vif `{colors.cyan}`** : courbes sous les bandeaux et vagues, décor uniquement. Blanc dessus ≈ 3:1, donc jamais de texte courant.
- **Turquoise du logo `{colors.logo}`** : réservé au logo.
- **Orange, deux rôles seulement :**
  - `{colors.orange}` (vif) est **décoratif uniquement** sur fond clair : trait de pinceau, étincelles, flèches, barres verticales. Jamais de texte en orange vif sur fond clair, ni de texte posé dessus. Exception : sur bleu nuit, l'orange vif peut servir au grand texte (6.6:1), là où l'orange foncé ne passe pas (2.9:1).
  - `{colors.accent}` (foncé) sert au texte orange, au mot mis en avant dans un titre et aux fonds de boutons orange, avec un texte blanc (5.7:1). Sur les pastels, il fait 5:1.
- **Pastels `{colors.sky}` et `{colors.peach}`** : fonds de cartes, en alternance dans une même rangée. Le texte posé dessus est `{colors.primary}`.
- Les couleurs de catégorie du catalogue (`cat-*` dans `globals.css`) restent à part : elles distinguent les 4 familles de formation. Les anciennes couleurs (`secondary`, `muted`, `pastel`) ont disparu avec la story 4.6 ; les textes secondaires gris (placeholders, aides de formulaire) utilisent `stone-600` (≥ 6.8:1 sur blanc et pastels).

À éviter : toute couleur hors de cette liste ; un texte sur l'orange vif ou le turquoise vif ; une couleur comme seul porteur d'information ; tout dégradé.

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

- **Bandeau de section (`SectionBanner`)** : aplat `{colors.petrol}` plein derrière le texte, prolongé d'une vague dessinée en dessous. Contenu : une icône au trait blanche, une barre `{colors.orange}`, un titre blanc et un sous-titre manuscrit `{colors.sky}`. Le texte ne repose jamais sur la vague.
- **Carte pastel (`PastelCard`)** et **pastille (`Chip`)** : fond pastel en `{rounded.3xl}`. La pastille de titre est blanche sur `{colors.petrol}` ou `{colors.accent}`.
- **Message clé (`KeyMessage`)** : fond `{colors.sky}` avec une ampoule pétrole aux rayons orange, une barre orange et une phrase en Nunito extra-gras. Au maximum un par section.
- **Étapes (`Steps`)** : cartes ciel et pêche en alternance, numéro dans un cercle (`{colors.accent}`, `{colors.petrol}`, `{colors.primary}`), flèches orange entre les cartes.
- **Bulle (`Bubble`)** : nuage `{colors.sky}` avec deux petites bulles de queue, texte en Nunito 900. Posée sur un fond ciel (accueil), elle passe en blanc (`tone="white"`).
- **Décor (`Wave`, `Sparkle`, `BrushUnderline`)** : uniquement en `{colors.orange}`, `{colors.cyan}`, `{colors.petrol}` et `{colors.sky}`.
- **Logo (`Logo`)** : cercle `{colors.logo}`, lettre blanche, point `{colors.orange}`. La variante avec étincelles est réservée aux grands formats (accueil, supports). Fichiers source : `public/logo_elancestvous.svg` et `public/logo_elancestvous_etincelles.svg`.
- **Bouton orange** (variante `accent` de `components/ui/button.tsx`) : fond `{colors.accent}`, texte blanc, `{rounded.md}`. Le bouton secondaire teinté (FR12) est inchangé.
- **Pied de page** : fond `{colors.petrol}`, liens blancs, mentions en `{colors.sky}`.

Les maquettes de référence sont la proposition de charte (https://claude.ai/artifact/T8zuRxkaB6sh87BtkJmUv2) et la planche logo (https://claude.ai/artifact/Vew5ADwHUXiV9msQJbV7Mx). En cas de conflit, ce document l'emporte.

## Do's and Don'ts

| À faire | À éviter |
|---|---|
| Un bandeau pétrole par section, avec un vrai titre Hn | Des titres centrés sans bandeau à côté de sections déjà restylées |
| Alterner ciel et pêche dans une rangée de cartes | Une rangée de cartes toutes grises ou toutes de la même teinte |
| Orange vif pour le décor, `accent` (orange foncé) pour le texte et les boutons | Du texte ou un bouton blanc sur orange vif |
| 1 ou 2 touches manuscrites ou étincelles par écran | Kalam pour des paragraphes ; des étincelles partout |
| Étapes numérotées pour une vraie démarche ordonnée | Des numéros sur une simple liste de points |
| Échelle Tailwind par défaut (NFR1) | Des valeurs arbitraires `-[…]` |
| Garder titres, textes et URLs existants ; ajouter un titre utile si une section n'en a pas | Modifier ou retirer du contenu indexé pour « faire rentrer » un design |
| Placer l'action principale tôt dans l'ordre de lecture mobile | Un CTA atteignable seulement après toute la page sur smartphone |
| Images : uniquement des dessins tirés des slides, en médaillon rond (`public/illustrations/`) | Mélanger photos et dessins ; photos de banque d'images. Exceptions : vraies photos de Coralie, couvertures du blog |
