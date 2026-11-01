# elancestvous — conventions de travail

Site vitrine Next.js pour la coach Coralie Mathorel (Toulouse), avec un blog IA
hebdomadaire validé via Discord avant publication automatique. Voir
`docs/blog-architecture.md` pour le détail du pipeline. Pour ajouter une
formation au catalogue : `docs/formations/` (template à remplir par Coralie +
cookbook de publication).

## Règles

Les règles de travail vivent dans `.claude/rules/`, un fichier par thème,
chargés automatiquement par Claude Code. Toute nouvelle règle y va aussi, jamais
directement dans ce fichier.

Toujours chargées :

- `workflow-git.md` — une branche par tâche, une session neuve par story, PR
  vers `validation` jamais `master`, TDD, demander validation avant
  d'écrire du code, tests à lancer avant de pousser ;
- `revue-avant-pr.md` — revue du diff dans un contexte isolé avant toute PR ;
- `secrets.md` — noms de secrets, jamais de valeur de secret dans une
  conversation ;
- `pipeline-blog.md` — points d'attention connus du pipeline blog et Discord.

Chargée dès qu'un fichier de `app/`, `components/` ou `content/` est lu ou
modifié :

- `accessibilite.md` — détail des critères RGAA 4.1 / WCAG 2.2 AA.

**Rappel** : le site vise la conformité **RGAA 4.1** (référentiel français,
aligné sur **WCAG 2.1 niveau AA**) et suit les critères ajoutés par **WCAG 2.2
AA**. Toute modification d'interface doit les respecter, et les tests doivent le
vérifier quand c'est testable. Critères détaillés et charte visuelle de
référence : `.claude/rules/accessibilite.md`, à consulter avant de proposer ou
de concevoir une interface.
