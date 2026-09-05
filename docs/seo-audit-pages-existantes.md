# Audit SEO on-page — pages existantes

Complète `docs/blog-plan-editorial.md` (qui ne couvre que le contenu du futur
blog) avec une revue manuelle des pages déjà en ligne : accueil, à propos,
contact, les 4 pages de service. Pas d'outil d'audit automatisé exécuté ici
(voir la note sur `claude-seo` en fin de document) — findings vérifiés
directement dans le code (`grep`/lecture des fichiers), pas des suppositions.

## Ce qui est déjà solide (ne pas casser)

- **Metadata complète sur chaque page** : `title`, `description`, `alternates.canonical`,
  `openGraph` sont présents et différenciés sur les 8 pages (accueil, à propos,
  contact, mentions légales, 3 pages professionnels + 1 page particuliers).
- **Un seul `<h1>` par page**, y compris l'accueil (dans `components/home/Hero.tsx`,
  pas directement dans `app/page.tsx` — vérifié après une première fausse alerte).
- **Aucune balise `<img>` brute** : tout passe par `next/image` (bon pour le LCP/Core
  Web Vitals).
- **`/mentions-legales` correctement exclue de l'indexation** (`robots: { index: false }`)
  — contenu juridique générique, à raison.
- **Données structurées globales solides** (`components/JsonLd.tsx`) : `WebSite`,
  `Person`, `ProfessionalService` avec catalogue des 4 services.

## Findings concrets, par ordre de priorité

### 1. Maillage interne quasi inexistant entre les pages commerciales (priorité haute, correctif simple)

Vérifié par grep sur les 4 pages de service + à propos : **aucune ne fait de lien
vers une autre page de service ou vers à propos** — seul un lien vers `/contact`
existe (via `components/CtaElan.tsx`).

- L'accueil est correct : `components/home/Axes.tsx` lie vers les 3 pages
  professionnels, `components/home/Hero.tsx` lie vers la page particuliers.
- Mais une fois qu'un visiteur est *sur* une page de service, il n'a aucun chemin
  vers les offres connexes — un établissement qui lit la page GAPP ne voit jamais
  qu'il existe aussi du coaching collectif ou des formations QVCT/RPS, alors que
  ce sont des audiences et des besoins très proches.
- `app/a-propos/page.tsx` ne lie vers aucune page de service alors que c'est
  souvent une page à fort trafic de marque/notoriété — occasion manquée de
  rediriger ce trafic vers une conversion.

**Recommandation** : ajouter un bloc "Voir aussi" en bas de chacune des 3 pages
`professionnels-etablissements-de-soins/*` (liens croisés entre elles), et au
moins un lien contextuel dans `app/a-propos/page.tsx` vers la page de service la
plus pertinente selon le paragraphe (ex. le passage sur l'accompagnement des
soignants pourrait lier vers `coaching` ou `formations-rps-qvct`). Correctif
purement additif (JSX + `next/link`), aucun risque de régression.

### 2. Contenu relativement court sur les 4 pages de service (priorité moyenne)

Estimation du texte visible (hors JSX/attributs) : coaching établissements
~410 mots, formations RPS/QVCT ~287 mots, GAPP ~322 mots, coaching particuliers
~366 mots. C'est correct mais léger pour des pages qui doivent porter des
requêtes commerciales à peu de concurrence mais qui bénéficient d'un contenu
plus étoffé pour asseoir l'expertise (E-E-A-T) face à des pages concurrentes
souvent plus longues.

**Recommandation** : plutôt que de gonfler artificiellement le texte, s'appuyer
sur les articles de blog déjà planifiés qui répondent à des objections précises
sur ces pages (ex. l'article semaine 4 du plan éditorial, "Comment se déroule une
séance de coaching individuel ?", pourrait aussi justifier l'ajout d'un
court paragraphe "Comment ça se passe concrètement" directement sur
`app/particuliers/coaching-individuel/page.tsx`, avec un lien vers l'article pour
le détail). Le blog et les pages de service se nourrissent alors l'un l'autre au
lieu d'être traités séparément.

### 3. Aucune illustration sur les 4 pages de service (priorité basse)

Contrairement à l'accueil et à `à propos` (qui ont une image), les 4 pages de
service sont entièrement textuelles. Pas bloquant pour le SEO technique, mais
un manque pour l'engagement (temps passé sur la page) et pour le SEO image
(Google Images peut apporter du trafic qualifié sur des requêtes comme "GAPP
établissement de santé").

**Recommandation** : une illustration par page (photo ou visuel simple, cohérent
avec la charte graphique turquoise/marine), `alt` descriptif incluant le mot-clé
principal de la page — même logique que les couvertures du blog
(`docs/blog-secrets.md`), potentiellement générées par le même pipeline IA une
fois mature.

### 4. Pas de données structurées `BreadcrumbList` (priorité basse/moyenne)

Les 3 pages sous `/professionnels-etablissements-de-soins/...` ont une
hiérarchie d'URL à 2 niveaux, mais rien ne la formalise pour les moteurs
(pas de fil d'Ariane visuel, pas de schema `BreadcrumbList`). Un ajout correct
peut faire apparaître un fil d'Ariane dans les résultats de recherche pour ces
pages.

**Recommandation** : ajouter un composant `Breadcrumbs` (visuel + JSON-LD
`BreadcrumbList`) sur les 3 pages professionnels, réutilisable si d'autres
niveaux de profondeur apparaissent plus tard (ex. le blog).

## Prochaine étape possible : audit outillé

Comme noté dans `docs/blog-plan-editorial.md` (section 5), ces findings viennent
d'une lecture manuelle du code, pas d'un outil d'audit. Le plugin Claude Code
`claude-seo` (github.com/AgriciDaniel/claude-seo, mentionné dans le plan de
reprise initial) n'a toujours pas été installé ni exécuté sur ce dépôt — il
pourrait confirmer/compléter ces findings (performance réelle, balises
manquantes non détectées ici, comparaison concurrentielle) une fois installé
avec votre accord.
