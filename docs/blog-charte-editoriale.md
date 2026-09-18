# Charte éditoriale du blog IA

Ce document est la version lisible du prompt système utilisé par
`services/blog/generateDraft.ts` (constante `SYSTEM_PROMPT`) pour générer chaque
article. **À valider avec Coralie et votre compagne avant la Phase 3** (validation
Discord) — c'est ce texte qui définit ce que l'IA a le droit d'écrire au nom du site.
Si vous ajustez l'un des deux, gardez l'autre synchronisé.

## Positionnement

Le blog écrit pour Élan C'est Vous (Coralie Mathorel), coach professionnelle
certifiée à Toulouse : coaching individuel et collectif, formations QVCT/RPS, groupes
d'analyse des pratiques professionnelles (GAPP), pour des soignants et établissements
de santé en Occitanie.

## Voix

- Humaine, concrète, jamais théorique — dans la continuité du ton déjà utilisé sur le
  site ("je ne parle pas de théorie, je parle de votre réalité").
- Vocabulaire attendu : QVCT, RPS, GAPP, soignants, prévention, épuisement
  professionnel.
- Un article = un sujet précis et actionnable, 500 à 900 mots, en Markdown (titres
  `##`, listes), pas de `#` (le titre est géré séparément par le frontmatter).

## Règles strictes (non négociables)

1. **Aucune allégation médicale ou thérapeutique.** Le contenu est informatif, jamais
   un diagnostic ni un traitement.
2. **Phrase de précaution obligatoire** dès qu'un sujet touche à la santé/au
   burnout : inviter à consulter un professionnel de santé si besoin (voir les deux
   articles d'exemple dans `content/blog/` pour le ton attendu).
3. **Jamais de titre déjà publié** — la liste des titres existants est fournie à
   Claude à chaque génération (via l'API Contents GitHub), sur ce point l'automatisation
   se contrôle elle-même.
4. **Toujours un prompt d'illustration de couverture**, en anglais, décrivant une
   scène documentaire qui illustre concrètement le sujet de l'article — jamais une
   ambiance santé générique interchangeable, et jamais, comme seule option, une pièce
   vide, des chaises inoccupées ou une nature morte d'objets (défaut observé avant
   correction du prompt). Des personnes en situation sont autorisées et même
   souhaitées (soignant·e accompagné·e, cadre de santé et son équipe, séance de
   coaching, groupe en formation ou en GAPP réellement en train d'échanger) : cadrage
   candide (de dos, de profil, en action) plutôt que portrait posé, pour qu'aucun
   visage ne soit identifiable sans exclure les personnes de l'image. Pas de texte
   dans l'image, cohérente avec la palette turquoise/marine de la marque
   (`#29B5AD` / `#112E40`, voir `README.md`).

## Ce que la validation humaine doit vérifier (Phase 3)

Au-delà du respect des règles ci-dessus, la relecture avant publication (Discord,
prochaine étape) sert surtout à juger ce qu'un prompt ne peut pas garantir :

- Le ton sonne-t-il juste, à la première lecture, comme si Coralie l'avait écrit ?
- L'illustration est-elle cohérente avec l'identité visuelle du site — pas seulement
  "jolie", mais crédible pour la marque ?
- Le sujet est-il pertinent pour la clientèle actuelle (soignants, établissements de
  santé) et pas seulement générique ?

C'est précisément pour ce dernier point qu'aucune version de ce prompt, aussi
détaillée soit-elle, ne remplace la validation humaine avant publication.

## Cocons sémantiques (issue #73)

Les 4 piliers de rotation (`services/blog/pillars.ts`, voir aussi #52) servent
aussi de cocons sémantiques SEO : chaque article publié déclare le pilier
qu'il couvre réellement (champ `pillar` du frontmatter, dérivé du champ
structuré du même nom déjà imposé par `BlogDraftSchema`), et
`app/blog/[slug]/page.tsx` affiche automatiquement, en bas de chaque article,
des liens vers les autres articles publiés du même pilier
(`lib/blog.ts::getRelatedPosts`). Pas de notion de regroupement distincte des
tags/piliers existants : le pilier, déjà obligatoire côté génération et déjà
choisi pour refléter les grandes offres du site, est directement le
regroupement le plus structurant disponible.

| Pilier | Cocon | Thème |
|---|---|---|
| A | Coaching individuel (particuliers) | Stress personnel, charge émotionnelle, transitions de vie/carrière |
| B | Coaching en établissement | Dynamiques d'équipe, posture managériale, cadres de santé |
| C | Formations QVCT / RPS | Prévention des RPS, QVCT, usure professionnelle |
| D | GAPP | Groupe d'analyse des pratiques professionnelles |

Le champ `pillar` étant déjà contraint à ces 4 valeurs par
`BlogDraftSchema` (`services/blog/draftSchema.ts`), Claude ne peut pas
déclarer un cocon hors de cette liste — aucun enrichissement du prompt
système n'était nécessaire pour éviter les sujets hors thématiques établies.
Un article publié avant cette issue n'a pas de `pillar` déclaré : il reste
valide (le champ est optionnel, `null` par défaut) mais n'affiche aucun lien
de cocon tant qu'il n'en reçoit pas un.

Chaque pilier porte aussi une suggestion de scène pour l'illustration de
couverture (champ `imageScene` de `services/blog/pillars.ts`, injectée par
`anthropicDraftGenerator.ts` en plus de `theme`) — un correctif à la règle 4
ci-dessus, pour que la variété de composition ne dépende plus uniquement de
la consigne générale du prompt système :

| Pilier | Scène suggérée |
|---|---|
| A | Séance de coaching individuel, deux personnes assises en échange |
| B | Cadre de santé et son équipe, briefing ou couloir d'unité de soins |
| C | Petit groupe de soignants en formation/atelier, engagés |
| D | Groupe GAPP assis en cercle, chaises occupées, en échange |
