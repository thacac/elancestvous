# elancestvous — conventions de travail

Site vitrine Next.js pour la coach Coralie Mathorel (Toulouse), avec un blog IA
hebdomadaire validé via Discord avant publication automatique. Voir
`docs/blog-architecture.md` pour le détail du pipeline. Pour ajouter une
formation au catalogue : `docs/formations/` (template à remplir par Coralie +
cookbook de publication).

## Workflow Git

- Une branche par tâche, une PR par branche. Jamais de commit direct sur `master`.
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

## Revue avant PR (remplace GitHub Copilot)

L'abonnement Copilot du dépôt a expiré — plus de revue automatique sur les PR.
**Avant d'ouvrir une PR**, lancer une revue du diff dans un contexte isolé et
propre (skill `code-review`, ou un subagent dédié) plutôt que de se relire
soi-même : un regard qui n'a pas suivi l'implémentation pas à pas repère plus
facilement les vrais bugs. Corriger les findings confirmés (avec tests), vérifier
à nouveau (`yarn test`, `yarn tsc --noEmit`, `yarn lint`), puis pousser et ouvrir
la PR.

## Accessibilité (obligatoire)

Le site vise la conformité **RGAA 4.1** (référentiel français, aligné sur
**WCAG 2.1 niveau AA**) et suit les critères ajoutés par **WCAG 2.2 AA**. Toute
modification d'interface doit les respecter, et les tests doivent le vérifier
quand c'est testable :

- **Contrastes** : au moins 4.5:1 pour le texte courant, 3:1 pour le texte
  large (≥ 24 px, ou ≥ 18,66 px en gras) et pour les éléments graphiques
  porteurs de sens (icônes, bordures de champs, focus). Calculer le ratio
  (formule WCAG) avant de choisir une couleur ; ne jamais poser de texte blanc
  sur l'orange vif ou le turquoise vif.
- **Couleur** : jamais seule pour transmettre une information (ajouter texte,
  icône ou forme).
- **Structure** : un seul `h1` par page, hiérarchie de titres sans saut, listes
  sémantiques, repères (`header`, `nav`, `main`, `footer`), `lang="fr"`.
- **Images** : `alt` descriptif si l'image porte un sens, `alt=""` (ou
  `aria-hidden`) si elle est décorative ; aucun texte important dans une image.
- **Clavier** : tout est utilisable au clavier, focus toujours visible, ordre de
  tabulation logique, aucun piège au clavier.
- **Liens et boutons** : intitulé explicite (le nom accessible contient le texte
  visible) ; cibles d'au moins 24 × 24 px (WCAG 2.2).
- **Formulaires** : chaque champ a une étiquette, erreurs décrites en texte et
  reliées au champ.
- **Mouvement** : respecter `prefers-reduced-motion` ; aucune animation
  automatique de plus de 5 s sans moyen de la mettre en pause.
- **Zoom** : contenu lisible à 200 % et sans défilement horizontal à 320 px de
  large.
- Charte visuelle de référence (couleurs autorisées, contrastes calculés) :
  `_bmad-output/planning-artifacts/ux-designs/ux-elancestvous-2026-09-23/DESIGN.md`.

## Secrets

- Les noms de secrets GitHub Actions ne peuvent jamais commencer par `GITHUB_`
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
