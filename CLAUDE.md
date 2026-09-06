# elancestvous — conventions de travail

Site vitrine Next.js pour la coach Coralie Mathorel (Toulouse), avec un blog IA
hebdomadaire validé via Discord avant publication automatique. Voir
`docs/blog-architecture.md` pour le détail du pipeline.

## Workflow Git

- Une branche par tâche, une PR par branche. Jamais de commit direct sur `master`.
- Commits réguliers, messages descriptifs (français, cohérent avec l'historique).
- TDD obligatoire pour tout changement de code : écrire le test, le voir échouer,
  puis implémenter.
- Avant de pousser : `yarn test`, `yarn tsc --noEmit`, `yarn lint` doivent tous
  passer (une seule erreur `tsc` pré-existante et non liée est tolérée, déjà
  présente sur `master` dans `discordInteractionHandler.test.ts`).

## Revue avant PR (remplace GitHub Copilot)

L'abonnement Copilot du dépôt a expiré — plus de revue automatique sur les PR.
**Avant d'ouvrir une PR**, lancer une revue du diff dans un contexte isolé et
propre (skill `code-review`, ou un subagent dédié) plutôt que de se relire
soi-même : un regard qui n'a pas suivi l'implémentation pas à pas repère plus
facilement les vrais bugs. Corriger les findings confirmés (avec tests), vérifier
à nouveau (`yarn test`/`tsc`/`lint`), puis pousser et ouvrir la PR.

## Secrets

- Noms de secrets GitHub Actions ne peuvent jamais commencer par `GITHUB_`
  (préfixe réservé par la plateforme) — voir `docs/blog-secrets.md`.
- Ne jamais faire écho à une valeur de secret/jeton réelle dans une conversation ;
  si un secret a été exposé, le traiter comme compromis et le faire régénérer via
  le dashboard du fournisseur.

## Points d'attention connus

- `/api/blog/generate` n'est pas idempotent : ne jamais lui ajouter de logique de
  retry côté `curl` (incident déjà survenu — 4 générations dupliquées pour un seul
  déclenchement).
- Le flux d'interaction Discord ("Approuver"/"Retoucher") doit toujours répondre
  immédiatement en type 7 (boutons désactivés), jamais en différé (type 6), pour
  éviter une course au double-clic pendant le travail asynchrone qui suit.
- `githubBlogRepo.commitDraftBranch()` ne doit jamais force-pousher une branche
  `blog-draft/<slug>` existante (un ruleset de dépôt l'interdit) — commiter
  directement dessus à la place.
