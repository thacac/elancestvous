# Déroulé de toute tâche : interroger → planifier → implémenter → revoir

Obligatoire pour chaque changement, y compris un correctif qui semble petit ou
évident, une doc ou la CI. On ne saute pas d'étape.

1. **Interroger** : lire le code et les docs concernés, reformuler la demande,
   poser les questions ouvertes (comportement attendu, impact sur la prod, la
   Val, le pipeline blog, l'accessibilité). Pas de plan sur une hypothèse non
   vérifiée. Après un rapport de bug ou un comportement inattendu : diagnostic
   d'abord, jamais d'enchaînement direct sur une correction.
2. **Planifier** : plan écrit et présenté à l'utilisateur — fichiers touchés,
   tests à écrire, étapes/commits, impact sur la prod et la Val, retour
   arrière. **Validation explicite avant d'écrire du code.** Un plan validé
   peut être confié à une session neuve (brief autonome, voir
   `workflow-git.md`) qui l'exécute sans redemander ; tout écart au plan
   repasse par une validation.
3. **Implémenter** : TDD (test rouge, puis vert), commits réguliers, tests à
   lancer avant de pousser (`workflow-git.md`).
4. **Revoir** : revue du diff dans un contexte isolé (`revue-avant-pr.md`),
   correction des findings confirmés, puis PR vers `validation`. Jamais de
   fusion sans demande de l'utilisateur.
