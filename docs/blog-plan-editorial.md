# Plan éditorial SEO du blog

> **Périmètre de ce document : uniquement le contenu du blog.** Pour les
> recommandations sur les pages existantes du site (accueil, à propos,
> pages de service), voir `docs/seo-audit-pages-existantes.md` — notamment un
> maillage interne quasiment inexistant entre les pages commerciales
> elles-mêmes, complémentaire du maillage blog → pages décrit ci-dessous.

Ce document relie le contenu produit par le blog (`content/blog/`, généré
chaque semaine via `services/blog/generateDraft.ts`) au travail SEO déjà en
place : host canonique unifié sur `elancestvous.fr`, données structurées
(`components/JsonLd.tsx` : `WebSite`, `Person`, `ProfessionalService` avec un
catalogue de 4 services), et mots-clés déjà ciblés dans `app/layout.tsx`
(`metadata.keywords`).

Tant qu'aucun plan de contenu n'existait, `generateDraft.ts` proposait des
sujets sans liste de priorités ni lien obligatoire vers une page commerciale.
Ce document comble ce manque : il ne réinvente pas le positionnement (déjà
posé sur les 4 pages de service et la page « À propos »), il l'organise en
calendrier de publication.

**Principe directeur : le blog n'est pas une fin en soi, c'est un outil de
maillage interne.** Chaque article doit faire au moins un lien contextuel
(dans le corps du texte, pas uniquement en pied de page) vers la page de
service la plus pertinente — c'est ce lien qui transforme un lecteur en
prospect et qui remonte l'autorité SEO vers les pages qui convertissent.

## 1. Piliers thématiques

Calqués sur les 4 axes de service existants, plus un axe transversal de SEO
local.

| Pilier | Page de service cible | Ce que couvre le pilier |
| --- | --- | --- |
| **A — Coaching individuel (particuliers)** | `/particuliers/coaching-individuel` | Stress personnel, charge émotionnelle, transitions de vie/carrière, fonctionnement concret d'un accompagnement individuel. |
| **B — Coaching en établissement** | `/professionnels-etablissements-de-soins/coaching` | Coaching individuel et collectif pour cadres de santé, managers et équipes ; dynamiques d'équipe, posture managériale. |
| **C — Formations QVCT / RPS** | `/professionnels-etablissements-de-soins/formations-rps-qvct` | Prévention des RPS, QVCT, gestion du stress/des émotions, usure professionnelle — le pilier le plus commercial (achat B2B, budgets formation des établissements). |
| **D — GAPP** | `/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles` | Définition et fonctionnement du GAPP, différenciation avec des dispositifs voisins (supervision), bénéfices dans la durée. |
| **E — SEO local (transversal)** | `/a-propos`, page d'accueil, ou la page de service la plus proche du sujet | N'est pas un pilier de contenu autonome : c'est un angle (Toulouse, Haute-Garonne, Occitanie) à injecter dans des articles des 4 piliers ci-dessus, plus 1-2 articles dédiés à forte intention commerciale locale. |

Les deux articles déjà publiés se rattachent tous les deux au pilier C
(`qvct-par-ou-commencer-etablissement-sante`, `reconnaitre-signes-...`) — le
calendrier ci-dessous rééquilibre volontairement vers B, D et E pour ne pas
sur-représenter un seul pilier dans le maillage.

## 2. Mapping mot-clé → intention → titre → page cible

Base de travail pour les 12 premières semaines (voir calendrier en section 3)
et backlog pour la suite.

| Pilier | Mot-clé principal | Intention de recherche | Titre d'article proposé | Page liée (maillage) |
| --- | --- | --- | --- | --- |
| D | qu'est-ce qu'un GAPP | Définitionnelle | Qu'est-ce qu'un GAPP ? Définition et objectifs en établissement de santé | GAPP |
| B | coaching cadre de santé | Informationnelle → commerciale | Cadre de santé : comment prendre du recul sur sa posture managériale grâce au coaching ? | Coaching établissements |
| E | coach professionnel certifié Toulouse | Commerciale locale | Coach professionnelle certifiée à Toulouse : comment bien choisir son accompagnement ? | À propos (+ CTA coaching individuel) |
| A | comment se déroule un coaching individuel | Informationnelle (levée de frein) | Comment se déroule une séance de coaching individuel ? Déroulé et cadre | Coaching individuel (particuliers) |
| C | signaux RPS établissement de santé | Informationnelle | RPS en établissement de santé : quels signaux collectifs doivent alerter les équipes ? | Formations QVCT/RPS |
| D | GAPP supervision différence | Comparative | GAPP ou supervision d'équipe : quelles différences ? | GAPP |
| B/A | coaching individuel ou collectif établissement | Comparative → commerciale | Coaching individuel ou collectif en établissement : comment choisir ? | Coaching établissements (+ lien croisé coaching individuel) |
| A | accompagnement transition professionnelle | Commerciale | Transition professionnelle : quand et pourquoi se faire accompagner ? | Coaching individuel (particuliers) |
| C | différence QVCT RPS | Définitionnelle | QVCT et prévention des RPS : quelle différence, et pourquoi les deux comptent | Formations QVCT/RPS |
| C | prévention usure professionnelle soignants | Informationnelle | Usure professionnelle en établissement de santé : agir avant l'arrêt de travail | Formations QVCT/RPS (+ lien GAPP) |
| C/E | formation QVCT Occitanie | Commerciale locale | Formation QVCT en Occitanie : un accompagnement adapté aux établissements de santé du territoire | Formations QVCT/RPS |
| D | durée effets GAPP équipe | Informationnelle (longue traîne) | Combien de temps pour voir les effets d'un GAPP dans une équipe ? | GAPP |

### Backlog (semaines 13+, non calendarisé)

À réévaluer une fois les 12 premiers articles publiés et leurs performances
connues (Search Console) :

- « Coaching à distance : est-ce aussi efficace qu'en présentiel ? » (A → coaching individuel) — répond à une objection déjà présente sur la page.
- « Tensions dans une équipe soignante : le coaching collectif peut-il aider ? » (B → coaching établissements).
- « Formation gestion du stress pour soignants : à quoi s'attendre concrètement ? » (C → formations RPS/QVCT).
- « Reconversion vers le coaching après une carrière dans le soin » (E, angle « ancienne soignante », plutôt pour la page À propos / notoriété que pour la conversion directe).
- Déclinaisons locales supplémentaires du pilier E pour d'autres bassins d'Occitanie si la clientèle établissement s'étend hors Haute-Garonne (Montpellier, Tarbes, etc.) — à ne faire que si une demande réelle existe, pour ne pas diluer le SEO local sur Toulouse.

## 3. Calendrier de publication — 12 premières semaines

Le pipeline publie au rythme d'un article par semaine (voir
`docs/blog-architecture.md`, cron hebdomadaire). Les deux articles déjà en
zone de relecture ont été publiés à une semaine d'intervalle exacte
(25/08/2026 et 01/09/2026, un mardi) : le calendrier ci-dessous suppose que ce
jour de la semaine se poursuit, à ajuster si le cron change de jour.

| Semaine | Date visée | Pilier | Titre proposé | Mot-clé cible | Page liée | Pourquoi cette priorité |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 08/09/2026 | D | Qu'est-ce qu'un GAPP ? Définition et objectifs en établissement de santé | qu'est-ce qu'un GAPP | GAPP | Article pilier manquant sur un terme spécifique et peu concurrentiel ; le GAPP n'a encore aucun contenu de blog alors qu'il a sa propre page de service. |
| 2 | 15/09/2026 | B | Cadre de santé : comment prendre du recul sur sa posture managériale grâce au coaching ? | coaching cadre de santé | Coaching établissements | Cible un public décisionnaire (budget formation) ; concurrence modérée ; aligné sur l'expérience terrain de Coralie (ancienne soignante). |
| 3 | 22/09/2026 | E | Coach professionnelle certifiée à Toulouse : comment bien choisir son accompagnement ? | coach professionnel certifié Toulouse | À propos | Intention commerciale locale forte, concurrence locale faible à modérée ; renforce le maillage vers la page de positionnement personnel. |
| 4 | 29/09/2026 | A | Comment se déroule une séance de coaching individuel ? Déroulé et cadre | comment se déroule un coaching individuel | Coaching individuel (particuliers) | Lève un frein classique avant prise de rendez-vous ; requête précise à faible concurrence. |
| 5 | 06/10/2026 | C | RPS en établissement de santé : quels signaux collectifs doivent alerter les équipes ? | signaux RPS établissement de santé | Formations QVCT/RPS | Complète l'article déjà publié sur l'épuisement individuel avec un angle collectif/organisationnel distinct (pas de redite). |
| 6 | 13/10/2026 | D | GAPP ou supervision d'équipe : quelles différences ? | GAPP supervision différence | GAPP | Requête de comparaison peu concurrentielle ; clarifie une confusion fréquente ; construit le pilier GAPP (2e article). |
| 7 | 20/10/2026 | B | Coaching individuel ou collectif en établissement : comment choisir ? | coaching individuel ou collectif établissement | Coaching établissements | Requête de décision ; permet un maillage croisé entre les deux pages de coaching. |
| 8 | 27/10/2026 | A | Transition professionnelle : quand et pourquoi se faire accompagner ? | accompagnement transition professionnelle | Coaching individuel (particuliers) | Volume correct, public élargi (pas seulement soignants) ; aligné avec « transition professionnelle » déjà dans les mots-clés de la page. |
| 9 | 03/11/2026 | C | QVCT et prévention des RPS : quelle différence, et pourquoi les deux comptent | différence QVCT RPS | Formations QVCT/RPS | Clarifie deux sigles déjà ciblés dans `metadata.keywords` du site ; requête définitionnelle peu concurrentielle. |
| 10 | 10/11/2026 | C | Usure professionnelle en établissement de santé : agir avant l'arrêt de travail | prévention usure professionnelle soignants | Formations QVCT/RPS | Prolonge le sujet burnout déjà publié avec un angle organisationnel plutôt qu'individuel ; lien secondaire possible vers GAPP. |
| 11 | 17/11/2026 | C / E | Formation QVCT en Occitanie : un accompagnement adapté aux établissements de santé du territoire | formation QVCT Occitanie | Formations QVCT/RPS | SEO local régional, concurrence faible hors grandes métropoles ; complète le maillage local amorcé en semaine 3. |
| 12 | 24/11/2026 | D | Combien de temps pour voir les effets d'un GAPP dans une équipe ? | durée effets GAPP équipe | GAPP | Requête longue traîne à faible concurrence ; boucle le pilier GAPP à 3 articles avant la fin du trimestre. |

Répartition sur les 12 semaines : GAPP ×3, coaching établissements ×2,
coaching individuel ×2, formations QVCT/RPS ×4 (justifié par son potentiel
commercial B2B plus élevé), SEO local ×2 (dont un combiné à un article
formations). Chaque titre reste à ajuster librement par Claude au moment de
la génération (contrainte de la charte : jamais un titre déjà publié) — ce
tableau fixe le **sujet et le lien cible**, pas le titre au mot près.

## 4. Comment ce plan doit être consommé par `generateDraft.ts`

**Recommandation : ne pas coder ce mécanisme dans cette PR.** Cette PR est un
document de planification à valider avec Coralie ; le câbler dans le pipeline
de génération toucherait du code de production (`services/blog/`) qui suit du
TDD et une revue plus lourde. Voici la recommandation concrète pour une PR de
suivi dédiée :

1. **Ajouter un fichier de suivi structuré**, par ex.
   `content/blog/sujets-prioritaires.json`, dérivé du tableau de la section 3 :

   ```json
   [
     {
       "status": "a_publier",
       "title": "Qu'est-ce qu'un GAPP ? Définition et objectifs en établissement de santé",
       "keyword": "qu'est-ce qu'un GAPP",
       "targetPage": "/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles",
       "notes": "Semaine 1 — cornerstone GAPP, terme peu concurrentiel."
     }
   ]
   ```

   JSON plutôt qu'un nouveau format : aucune dépendance supplémentaire, et
   c'est trivial à éditer à la main pendant la relecture Discord (Phase 3) au
   fur et à mesure que le plan évolue.

2. **Étendre `AnthropicParseResult`/`parseDraft`** (dans
   `services/blog/anthropicDraftGenerator.ts` et l'interface
   `GenerateDraftDeps.anthropic` dans `generateDraft.ts`) pour accepter une
   liste de sujets prioritaires en plus des titres déjà publiés, et l'injecter
   dans le message utilisateur envoyé à Claude, par exemple :

   > « Sujet prioritaire suggéré pour cette semaine (tu peux t'en écarter si un
   > autre sujet est manifestement plus pertinent, mais justifie pourquoi) :
   > *{title}* — mot-clé cible : *{keyword}* — fais un lien interne explicite
   > vers {targetPage} dans le corps de l'article. »

3. **Statut mis à jour manuellement, pas automatiquement.** Après publication
   (validation Discord), l'entrée correspondante passe de `"a_publier"` à
   `"publie"` à la main dans le même fichier, lors de la même session de
   relecture — pas de couplage supplémentaire entre la génération hebdomadaire
   et l'écriture dans ce fichier, pour éviter une logique de synchronisation
   fragile (double publication, écriture concurrente lors d'un retry, etc.).
   Si ce fichier n'a plus d'entrée `"a_publier"`, `generateDraft.ts` retombe
   sur son comportement actuel (proposition libre par Claude), donc rien ne
   casse si le plan n'est pas tenu à jour.
4. **TDD requis** pour cette extension, conformément aux tests déjà en place
   dans `services/blog/__tests__/generateDraft.test.ts` : un test doit vérifier
   que le sujet prioritaire (quand il existe) apparaît dans le message envoyé
   à `parseDraft`, et qu'en son absence le comportement actuel (aucun sujet
   imposé) est inchangé.

## 5. Prochaine étape possible : audit SEO plus poussé

Ce plan a été construit à partir d'une lecture manuelle du positionnement
existant (pages de service, JSON-LD, mots-clés) et d'une estimation qualitative
du volume de recherche et de la concurrence — pas d'un outil d'audit dédié.

L'utilisateur dispose d'un plugin Claude Code, **claude-seo**
(github.com/AgriciDaniel/claude-seo), qui n'a pas encore été installé ni
exécuté sur ce dépôt. Une fois ce plan validé et les premiers articles
publiés (blog rendu public via `BLOG_ENABLED`), il serait
pertinent de :

- l'installer et l'exécuter pour un audit technique complémentaire (maillage
  interne réel une fois le blog en ligne, balises, performance, éventuels
  problèmes d'indexation) ;
- croiser ses résultats avec les données réelles de Search Console une fois
  quelques semaines de publication passées, pour valider ou ajuster les
  priorités du calendrier de la section 3 (un mot-clé qui ne génère aucune
  impression après 2-3 mois doit être remplacé par une entrée du backlog).

Cette étape n'a pas été réalisée dans le cadre de cette PR — elle est notée
ici comme suite logique, à la main de l'utilisateur ou d'une session
ultérieure.
