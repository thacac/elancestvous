# Guide de validation des articles — Discord

> **État actuel** : le comportement décrit ci-dessous est réel — "Approuver" publie
> effectivement l'article, "Retoucher" relance effectivement Claude avec vos retours
> (Phase 3-4 livrées, voir issue #35). Ce guide reste à mettre à jour avec des
> captures d'écran réelles.

## Ce qui va se passer, chaque semaine

1. Un article est généré automatiquement (texte par Claude, illustration par IA) et
   déposé dans un salon Discord privé (vous + Coralie/votre compagne — personne
   d'autre n'y a accès).
2. Le message contient : l'image de couverture, le titre, l'extrait, et un lien de
   prévisualisation vers le site (rendu exactement comme l'article publié le sera).
3. Deux boutons sous le message : **Approuver** et **Retoucher**.

## Approuver

Un clic suffit. L'article est publié automatiquement dans les minutes qui suivent
(le temps que le site se reconstruise) — pas d'action supplémentaire nécessaire. Le
message Discord se met à jour pour indiquer "✅ Publié" avec le lien final.

## Retoucher

Le bouton ouvre une petite fenêtre où écrire, en quelques mots, ce qui doit changer —
par exemple :
- « Le titre est trop générique, propose quelque chose de plus concret »
- « Le ton est trop familier pour ce sujet »
- « L'illustration ne correspond pas du tout au propos »

L'IA relit l'article à la lumière de ces retours et repropose une nouvelle version
dans le même salon, avec les mêmes boutons. Il n'y a pour l'instant pas de limite au
nombre de retouches successives — au-delà de 2-3 allers-retours sans résultat
satisfaisant, mieux vaut reprendre l'article à la main plutôt que d'insister sur des
retouches automatiques.

## Ce qui ne se passe jamais automatiquement

- Un article n'est **jamais** publié sans un clic explicite sur "Approuver".
- Une semaine sans validation = une semaine sans nouvel article publié. Rien ne
  s'accumule ni ne se publie "par défaut" en votre absence.

## Bon à savoir

- Discord est utilisé plutôt que WhatsApp : pas de vérification d'entreprise Meta à
  obtenir, pas de bot serveur permanent à maintenir — c'est une simple route web sur
  le site déjà en ligne qui reçoit les clics. Voir `docs/blog-architecture.md` pour le
  détail technique.
- Le salon Discord est privé — seules les personnes que vous y invitez peuvent voir
  les brouillons et cliquer sur les boutons.
