# Secrets


- Les noms de secrets GitHub Actions ne peuvent jamais commencer par `GITHUB_`
  (préfixe réservé par la plateforme) — voir `docs/blog-secrets.md`.
- Ne jamais faire écho à une valeur de secret/jeton réelle dans une conversation ;
  si un secret a été exposé, le traiter comme compromis et le faire régénérer via
  le dashboard du fournisseur.
