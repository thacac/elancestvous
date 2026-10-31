---
name: Élan C'est Vous — charte slides
status: final
updated: 2026-10-30
sources:
  - .memlog.md
  - ../../prds/prd-elancestvous-2026-09-25/prd.md
  - ../../epics.md
---

# Élan C'est Vous — Experience Spine

## Foundation

Site vitrine web responsive en Next.js 16 et Tailwind CSS v4, avec des primitives shadcn/ui (`components/ui/`). `DESIGN.md` est la référence de l'identité visuelle. Ce document fixe le comportement des composants de la charte (`components/charte/`) et les règles d'expérience communes à toutes les pages.

Priorité absolue, fixée par Cédric : **le SEO d'abord.** La charte habille le contenu sans jamais le modifier. Le SEO, c'est d'abord le contenu : ajouter un titre utile est permis, modifier ou retirer un titre, un texte indexé ou une URL ne l'est pas.

Deuxième règle, fixée par Cédric : **l'interface d'abord, efficace sur smartphone.** L'ordre de lecture en une colonne amène l'action principale tôt (voir « Responsive & Platform »).

## Information Architecture

L'arborescence est celle de la PRD (§4.1–4.2, Epics 1 et 2) et ne change pas : Accueil, `/formations` (hub, familles, fiches), `/coaching` (particuliers, établissements), `/gapp-analyse-pratiques-professionnelles`, blog, à propos, contact. La charte s'applique page par page selon l'Epic 4, sans toucher aux URLs ni aux redirections.

## Voice and Tone

Le site s'adresse au visiteur comme une formatrice à son groupe : il pose des questions, puis propose.

| À faire | À éviter |
|---|---|
| « Et vous, comment allez-vous vraiment ? » | « Boostez le bien-être de vos équipes ! 🚀 » |
| « Parlons-en, sans engagement » | « Contactez-nous dès maintenant » |
| Une question qui ouvre une section (bulle) | Plus d'une bulle-question par écran |
| Des faits sourcés (repères DREES avec leur source) | Des chiffres sans source, ou inventés (NFR3) |

## Component Patterns

| Composant | Usage | Règles de comportement |
|---|---|---|
| `SectionBanner` | Ouvre une section | Rend un vrai titre au niveau choisi par la page (`as`, h2 par défaut) ; `id` d'ancre posé sur le titre ; sous-titre en `<p>` hors du titre ; icône et vague en `aria-hidden`. |
| `KeyMessage` | Clôt une section ou un article | `role="note"` avec un nom (« À retenir » par défaut), jamais `<aside>` : il ne crée pas de repère de navigation. |
| `Steps` | Démarche ordonnée uniquement | `<ol role="list">` ; un titre h3 (ou h4) par étape ; numéros et flèches en `aria-hidden` ; la description accepte un bloc (liste). |
| `PastelCard` / `Chip` | Groupes de contenus parallèles | La carte est un `<article>` par défaut (ou `li`/`div`/`section`). La pastille est une simple étiquette, jamais cliquable. |
| `Bubble` | Question posée au visiteur | `<p>` par défaut ; peut être un vrai titre quand la question structure la section. |
| `Wave` / `Sparkle` / `BrushUnderline` | Décor | Toujours `aria-hidden`. Le texte souligné reste un texte ordinaire, indexé tel quel. |
| `Logo` | Barre de navigation, accueil | Décoratif à côté du nom (navbar) ; image nommée quand il est seul ; étincelles réservées aux grands formats. |

## State Patterns

| État | Où | Traitement |
|---|---|---|
| Polices en chargement | Partout | `display: swap` et polices de repli déclarées : le texte reste lisible tout de suite. |
| Mouvement réduit demandé | Logo de l'accueil | Les étincelles restent fixes (`motion-safe`). |
| Animation | Logo de l'accueil | Deux scintillements au chargement puis immobile, en moins de 5 s (WCAG 2.2.2). |
| Famille sans formation publiée | Hubs Famille | État vide honnête (PRD UJ-1), présenté dans une carte pastel. |
| Donnée Qualiopi manquante | Fiches formation | Placeholder explicite (NFR3), inchangé par la charte. |

## Interaction Primitives

- Seuls les boutons et les liens sont interactifs. Les cartes, pastilles, bulles et étapes ne le sont jamais, sauf si elles contiennent un lien explicite.
- Le focus clavier reste visible sur tous les éléments interactifs.
- Le survol des boutons orange garde un texte lisible : fond `accent` (orange foncé) ou primary, jamais l'orange vif.

## Accessibility Floor

- Contraste d'au moins 4.5:1 pour tout texte de taille courante. Le blanc ne se pose jamais sur l'orange vif ; le texte orange utilise `accent` (orange foncé). Règle complète : section « Accessibilité » de `CLAUDE.md` (RGAA 4.1 / WCAG 2.2 AA).
- Tout le décor est `aria-hidden`. Chaque section garde un titre Hn réel.
- Aucune animation automatique de plus de 5 s ; les animations respectent `prefers-reduced-motion`.
- Les listes ordonnées sans puces gardent `role="list"` (Safari / VoiceOver).

## Key Flows

Les parcours sont ceux de la PRD (§2.3). La charte les sert sans les modifier.

1. **UJ-1, Amandine (référente QVCT)** arrive depuis Google sur le hub « Prévention RPS/QVCT ».
   1. Le bandeau pétrole annonce la section.
   2. Les formations disponibles s'affichent en premier, en cartes pastel.
   3. *Moment clé :* elle compare deux fiches et clique « Demander un devis » (bouton orange lisible).
2. **UJ-2, Marc (directeur)** vient d'un article de blog.
   1. Le message clé en fin d'article l'amène vers le hub « Cadre légal ».
   2. *Moment clé :* il ouvre la fiche « Obligations légales » et demande un devis.
3. **UJ-3, Sophie (cadre de santé)** filtre le catalogue par pastille de famille.
   1. Elle ouvre deux fiches.
   2. *Moment clé :* elle tranche sur le format.
4. **Accueil (nouveau, Epic 4).** Un visiteur établissement lit le titre et voit la bulle « Et vous, comment allez-vous vraiment ? ».
   1. Il parcourt les 3 axes (cartes de poids égal, FR11) et le déroulé d'accompagnement en 4 étapes.
   2. *Moment clé :* la bulle-question finale et le bouton « Prendre contact ».

## Responsive & Platform

- Conception en une colonne d'abord. L'action principale arrive tôt dans l'ordre de lecture mobile. Fiche formation : titre, introduction, puis la fiche pratique ouverte par « Demander un devis », puis le détail. Sur desktop, la fiche pratique passe dans la colonne de droite et reste collée au défilement.
- Aucun défilement horizontal à 320 px. Les grands titres (H1) sont réduits sur smartphone (`text-3xl`) et gardent `break-words` en filet de sécurité, sans `hyphens-auto`, qui coupait des mots tenant sur la ligne. La césure (`hyphens-auto`) est réservée aux titres de cartes étroites.
- Un filtre ou un lien interne ramène au contenu visé (ancre), pas en haut de page.

- Rangées de cartes et d'étapes : 4 colonnes → 2 → 1.
- Flèches entre étapes à partir de `lg` uniquement.
- Bandeau : le titre peut passer sur plusieurs lignes, il reste toujours sur l'aplat pétrole.
- Logo de l'accueil : la moitié de la largeur sur mobile.
