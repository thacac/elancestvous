# Cookbook — Publier une formation

> Source : document Claude Docs « Cookbook — Publier une formation » (https://claude.ai/artifact/WUJATq4VmyRjSvUL1hLR1s), créé le 29/09/2026. Copie versionnée dans le dépôt.

## Comment utiliser ce document

Ce cookbook explique comment une nouvelle formation passe du [Template — Nouvelle formation](./template-nouvelle-formation.md) rempli par Coralie jusqu'à sa mise en ligne réelle sur elancestvous.fr. Il couvre les deux rôles du circuit :

- **Coralie** : remplit le Template, une formation à la fois, et l'envoie.
- **La personne qui publie** (généralement un développeur du projet) : convertit le contenu envoyé en fichier technique et le met en ligne en suivant le circuit Git habituel du dépôt (voir `CLAUDE.md`).

Chaque étape ci-dessous précise qui agit et ce qu'il fait.

Circuit de publication (6 étapes, 2 personnes) :

1. Coralie remplit le Template.
2. Coralie l'envoie à la personne qui publie.
3. La personne qui publie le convertit en `content/formations/<slug>.md`.
4. Elle ouvre une PR vers `validation` (TDD, revue isolée).
5. Elle vérifie la fiche sur la Val (https://val.elancestvous.fr).
6. Elle ouvre la PR de promotion `validation` → `master` : la fiche est en ligne.

Les étapes 1 et 2 sont les vôtres ; à partir de l'étape 3, la personne qui publie prend le relais jusqu'à la mise en ligne.

## Étape 1 — Coralie remplit et envoie (à faire par vous)

1. Ouvrez le [Template — Nouvelle formation](./template-nouvelle-formation.md) et dupliquez-le, ou remplissez-le directement en ligne — un exemplaire par formation.
2. Remplissez chaque section avec vos propres mots ; les crochets `[à remplir]` indiquent ce qui est attendu. Le champ « Programme » attend plusieurs modules numérotés (titre + description), pas un seul bloc de texte.
3. Les champs Qualiopi en bas de page (tarif, indicateurs de résultats…) sont facultatifs : laissez-les vides si vous ne les avez pas encore, la fiche affichera « À confirmer » à leur place plutôt qu'une valeur inventée.
4. Une fois rempli, envoyez le document (partagez-en le lien, ou exportez-le) à la personne qui publie sur le site. Vous pouvez aussi laisser un commentaire directement dans le Template si vous avez une question ou une hésitation.

Vous n'avez rien d'autre à faire : pas de fichier à créer, pas de Git, pas de code.

## Étape 2 — Convertir le Template en fiche technique (à faire par la personne qui publie)

Le Template reprend exactement les champs attendus par `lib/formations.ts`. Correspondance à utiliser lors de la conversion :

| Champ du Template | Champ technique (frontmatter) | Remarque |
| --- | --- | --- |
| Titre | `titre` |  |
| (dérivé du titre) | `slug` | slug d'URL, minuscules et tirets |
| Famille | `famille` | un des 4 identifiants exacts (voir tableau ci-dessous), jamais le libellé |
| Objectifs pédagogiques | `objectifsPedagogiques` | liste |
| Prérequis | `prerequis` | texte libre, « Aucun » si aucun |
| Public visé | `publicVise` | liste |
| Programme | `programme` | liste d'objets `{ titre, texte }`, un par module |
| Durée | `duree` |  |
| Format | `format` |  |
| Délai d'accès | `delaiAcces` |  |
| Modalités pédagogiques et d'évaluation | `modalitesEvaluation` |  |
| Accessibilité | `accessibilite` |  |
| Référent handicap | `referentHandicap` | `null` si non renseigné |
| Tarif | `tarif` | `null` si non renseigné |
| Indicateurs de résultats | `indicateursResultats` | `null` si non renseigné |
| Texte d'introduction | corps Markdown du fichier | paragraphe sous le frontmatter |

Correspondance Famille (libellé Coralie → identifiant technique) :

| Libellé (Template) | Identifiant (`famille`) |
| --- | --- |
| Cadre légal, droits et éthique | `cadre-legal-etablissements-sante` |
| Prévention des RPS et QVCT | `prevention-rps-qvct-etablissements-sante` |
| Accompagnement et pratiques professionnelles | `accompagnement-professionnel-etablissements-sante` |
| Dynamique d'équipe et développement professionnel | `dynamique-equipe-etablissements-sante` |

Créez le fichier sous `content/formations/<slug>.md`, avec ce frontmatter YAML puis le paragraphe d'intro en corps de fichier. Le fichier `content/formations/diagnostic-plan-action-qvct.md` déjà publié sert d'exemple réel complet.

> Ne jamais déposer le Template lui-même (ni aucun autre `.md` non conforme) dans `content/formations/` : tous les `.md` de ce dossier sont chargés et validés comme des fiches.

## Étape 3 — Circuit Git : TDD, revue isolée, PR vers `validation`

Suivez exactement le workflow défini dans `CLAUDE.md` :

1. Créez une branche dédiée à cette formation (jamais de commit direct sur `master`).
2. TDD obligatoire : ajoutez d'abord un test qui échoue (par exemple dans `lib/__tests__/formations.test.ts` ou dans les tests de la page catalogue/fiche concernée), vérifiez qu'il échoue, puis ajoutez le fichier `.md` pour le faire passer.
3. Avant de pousser : `yarn test`, `yarn tsc --noEmit` et `yarn lint` doivent tous passer.
4. Lancez une revue isolée du diff (skill `code-review`, ou un subagent dédié) — l'abonnement Copilot du dépôt a expiré, il n'y a plus de revue automatique sur les PR. Corrigez les findings confirmés, avec tests, puis revérifiez `yarn test` / `yarn tsc --noEmit` / `yarn lint`.
5. Ouvrez la PR **vers `validation`**, jamais vers `master` — un garde-fou (`guard-master.yml`) refuse toute PR de feature ciblant `master` directement.

## Étape 4 — Vérifier sur la Val, puis promouvoir vers `master`

1. Une fois la PR fusionnée dans `validation`, la formation est déployée sur la Val : https://val.elancestvous.fr. Vérifiez-y la fiche (affichage, orthographe, lien depuis le catalogue et le hub de sa famille).
2. Si besoin, corrigez sur une nouvelle branche vers `validation`, comme pour tout autre changement.
3. Quand tout est validé, ouvrez une PR de **promotion `validation` → `master`** — c'est la seule PR que `guard-master.yml` accepte vers `master` (voir `DEPLOYMENT.md`). Une fois fusionnée, la formation est en ligne sur le vrai site.

## Délais et où en est ma formation ?

Il n'y a pas d'automatisation pour ce circuit — chaque étape dépend de la disponibilité de la personne qui publie. À titre indicatif : remplir le Template prend de quelques minutes à une demi-heure selon la formation ; la conversion technique et la revue prennent généralement de quelques heures à quelques jours ; la mise en ligne finale dépend du rythme des promotions vers `master`.

Pour savoir où en est votre formation, le plus simple est de demander directement à la personne qui publie, ou de lui demander le lien de la PR en cours — son état (ouverte, fusionnée dans `validation`, en ligne) s'y lit directement.

## Questions fréquentes et pièges connus

**Puis-je modifier directement le fichier YAML/Markdown ?** Non — n'y touchez jamais vous-même ; passez toujours par le Template. Cela évite les erreurs de syntaxe (YAML mal formé) qui font planter la génération du site.

**Un champ Qualiopi (tarif, référent handicap, indicateurs de résultats) n'est pas encore connu, que faire ?** Laissez-le vide dans le Template. La fiche affiche automatiquement « À confirmer » — jamais une valeur inventée. Vous pourrez le compléter plus tard, via une mise à jour suivant le même circuit.

**Le Programme doit-il être un seul paragraphe ?** Non — il doit compter au moins un module, chacun avec un titre court et une description. C'est ce qui permet l'affichage numéroté (01, 02…) sur la fiche.

**Puis-je poser une question sur un champ précis pendant que je remplis le Template ?** Oui, commentez directement le passage concerné dans le Template — la personne qui publie (ou moi) peut y répondre sans attendre l'envoi complet.
