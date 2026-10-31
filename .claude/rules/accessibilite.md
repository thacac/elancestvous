---
paths:
  - "app/**"
  - "components/**"
  - "content/**"
---

# Accessibilité (obligatoire)


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
