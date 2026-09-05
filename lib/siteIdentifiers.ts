/**
 * Identifiants JSON-LD partagés entre components/JsonLd.tsx (schéma global du
 * site) et components/PostJsonLd.tsx (schéma par article de blog). Centralisés
 * ici pour qu'un changement de domaine ou d'@id ne puisse pas diverger entre
 * les deux fichiers.
 */
export const SITE = "https://elancestvous.fr";
export const ORG_ID = `${SITE}/#organization`;
export const PERSON_ID = `${SITE}/#coralie-mathorel`;
export const WEBSITE_ID = `${SITE}/#website`;
