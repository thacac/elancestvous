import { NextResponse } from "next/server";

const content = `# Élan C'est Vous

> Coaching individuel et collectif, formations QVCT/RPS et groupes d'analyse des pratiques professionnelles pour les professionnels et établissements de santé.
> Animé par Coralie Mathorel, ancienne soignante, coach certifiée.
> Site : https://elancestvous.fr

## Pages

- [Accueil](https://elancestvous.fr): Présentation générale de l'offre d'accompagnement.
- [À propos](https://elancestvous.fr/a-propos): Parcours et méthode de Coralie Mathorel, coach certifiée, ancienne soignante.
- [Coaching individuel — Particuliers](https://elancestvous.fr/particuliers/coaching-individuel): Accompagnement de coaching individuel pour toute personne souhaitant clarifier une situation, débloquer un obstacle ou travailler un objectif précis. Environ 8 séances, à distance, cadre confidentiel.
- [Coaching — Établissements de soins](https://elancestvous.fr/professionnels-etablissements-de-soins/coaching): Coaching individuel ou collectif pour les équipes et professionnels en établissements de santé. Cadres de santé, managers, équipes en transition.
- [Formations QVCT / RPS](https://elancestvous.fr/professionnels-etablissements-de-soins/formations-rps-qvct): Formations professionnelles sur la gestion du stress, des émotions et la prévention de l'usure professionnelle. Cycle structuré en ateliers courts, pédagogie ancrée dans le réel.
- [GAPP — Groupe d'analyse des pratiques professionnelles](https://elancestvous.fr/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles): Espace sécurisé de réflexion collective pour analyser et améliorer les pratiques professionnelles en équipe. Animé par une coach en cours de certification GAPP.
- [Contact](https://elancestvous.fr/contact): Premier échange gratuit pour définir ensemble la forme d'accompagnement la plus adaptée.

## Profil

- Coach certifiée, ancienne soignante
- Spécialisation : secteur de la santé, prévention de l'épuisement professionnel, RPS, QVCT
- Modalités : à distance et présentiel
- Contact : contact@elancestvous.fr
`;

export async function GET() {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
