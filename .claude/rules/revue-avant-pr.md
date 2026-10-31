# Revue avant PR (remplace GitHub Copilot)


L'abonnement Copilot du dépôt a expiré — plus de revue automatique sur les PR.
**Avant d'ouvrir une PR**, lancer une revue du diff dans un contexte isolé et
propre (skill `code-review`, ou un subagent dédié) plutôt que de se relire
soi-même : un regard qui n'a pas suivi l'implémentation pas à pas repère plus
facilement les vrais bugs. Corriger les findings confirmés (avec tests), vérifier
à nouveau (`yarn test`, `yarn tsc --noEmit`, `yarn lint`), puis pousser et ouvrir
la PR.
