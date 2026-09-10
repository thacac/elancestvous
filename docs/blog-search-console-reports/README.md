# Rapports Search Console — blog

Généré par `yarn blog:search-console-report` (issue #57). Un fichier JSON daté
par exécution (`AAAA-MM-JJ.json`), format `SearchConsoleReport`
(`services/blog/searchConsoleReport.ts`) : clics/impressions/position par
article publié, agrégés par pilier, avec des diagnostics numériques objectifs
(`ZERO_IMPRESSIONS`, `LOW_CTR_TOP10`, `POOR_POSITION`) et le delta par rapport
au run précédent.

Volontairement committé (pas gitignore) : c'est l'historique qui permettra,
après 2-3 mois de publication, la décision de #57 (déprioriser un pilier sans
impression dans le tourniquet pondéré de #52). Un run isolé ne suffit pas à
cette décision — voir le contexte complet dans l'issue.

Le jugement qualitatif (une requête dans `topQueries` correspond-elle vraiment
au sujet de l'article ?) n'est pas automatisé dans le script — à faire en
relisant le JSON, pas en codant une heuristique de correspondance de chaînes
qui serait peu fiable.

## Génération automatique

`.github/workflows/blog-seo-report-trigger.yml` lance le script le 1er de
chaque mois (`cron`) et sur demande (`workflow_dispatch`, bouton "Run
workflow" dans l'onglet Actions de GitHub). Le fichier généré est committé
directement sur `master` par le workflow (donnée générée, pas du code — même
logique que les commits automatiques "blog: actualité ajoutée à la file").
Tant que `GSC_SERVICE_ACCOUNT_JSON`/`GSC_SITE_URL` ne sont pas configurés en
secrets GitHub Actions, le job ne fait rien (voir #57).
