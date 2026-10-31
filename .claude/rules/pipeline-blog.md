# Points d'attention connus (pipeline blog et Discord)


- `/api/blog/generate` n'est pas idempotent : ne jamais lui ajouter de logique de
  retry côté `curl` (incident déjà survenu — 4 générations dupliquées pour un seul
  déclenchement).
- Le flux d'interaction Discord ("Approuver"/"Retoucher") doit toujours répondre
  immédiatement en type 7 (boutons désactivés), jamais en différé (type 6), pour
  éviter une course au double-clic pendant le travail asynchrone qui suit.
- `githubBlogRepo.commitDraftBranch()` ne doit jamais force-pousher une branche
  `blog-draft/<slug>` existante (un ruleset de dépôt l'interdit) — commiter
  directement dessus à la place.
