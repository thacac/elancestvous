# Workflow Git

- Une branche par tâche, une PR par branche. Jamais de commit direct sur `master`.
- Chaque story se lance dans une **session Claude Code neuve**, jamais à la suite
  d'une autre story dans la même session : un contexte propre évite de traîner
  les hypothèses de la story précédente. La session qui lance la story (par
  exemple via `create_session`) lui donne un brief autonome : règles,
  décisions déjà prises, pièges connus, périmètre et déroulé attendu.
- Les PR de feature ciblent **`validation`** (déployée sur la Val,
  https://val.elancestvous.fr), jamais `master` : seule une PR de promotion
  `validation` → `master` y est acceptée (check `guard-master.yml`). Voir
  `DEPLOYMENT.md`.
- Commits réguliers, messages descriptifs (français, cohérents avec l'historique).
- TDD obligatoire pour tout changement de code : écrire le test, le voir échouer,
  puis implémenter.
- Toujours demander validation (expliquer la modif envisagée et pourquoi) avant
  d'écrire du code — même pour un correctif qui semble petit ou évident. Ne pas
  enchaîner sur l'implémentation d'une correction suite à un rapport de bug/
  comportement inattendu sans confirmation explicite au préalable.
- Avant de pousser : `yarn test`, `yarn tsc --noEmit`, `yarn lint` doivent tous
  passer (une seule erreur `tsc` pré-existante et non liée est tolérée, déjà
  présente sur `master` dans
  `services/blog/__tests__/discordInteractionHandler.test.ts`).
