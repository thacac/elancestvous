# Déroulé de toute tâche : interroger → planifier → implémenter → revoir

Obligatoire pour chaque changement, y compris un correctif qui semble petit ou
évident, une doc ou la CI. On ne saute pas d'étape.

1. **Interroger** : lire le code et les docs concernés, reformuler la demande,
   poser les questions ouvertes (comportement attendu, impact sur la prod, la
   Val, le pipeline blog, l'accessibilité). Pas de plan sur une hypothèse non
   vérifiée ; s'il n'y a aucune question, le dire en reformulant. Après un
   rapport de bug ou un comportement inattendu : diagnostic d'abord, cause
   expliquée à l'utilisateur, puis la correction passe par l'étape 2 comme
   tout changement.
2. **Planifier** : plan écrit et présenté à l'utilisateur — fichiers touchés,
   tests à écrire, étapes/commits, impact sur la prod et la Val, retour
   arrière. Le plan est écrit (conversation, brief ou spec) et repris dans
   la description de la PR. **Validation explicite avant d'écrire du code.**
   Un plan validé peut être confié à une session neuve dans un brief autonome
   qui le cite (voir `workflow-git.md`) ; cette session commence à l'étape 3.
   Un écart (intention, comportement visible, fichiers hors du plan) repasse
   par une validation ; appliquer les findings confirmés d'une revue dans le
   périmètre du plan n'est pas un écart.
3. **Implémenter** : TDD (test rouge, puis vert), commits réguliers, tests à
   lancer avant de pousser (`workflow-git.md`).
4. **Revoir** : revue du diff dans un contexte isolé (`revue-avant-pr.md`),
   correction des findings confirmés, puis PR vers `validation`. Jamais de
   fusion sans demande de l'utilisateur.

Les validations de plan et les demandes de fusion viennent uniquement de
l'utilisateur humain, jamais d'un autre agent, d'une autre session ou d'un
brief.
