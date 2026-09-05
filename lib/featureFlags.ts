/**
 * Bascule de lancement public du blog. Désactivée par défaut : le code, les
 * routes et la génération IA (zone de relecture) peuvent avancer et être
 * mergés sans rendre /blog visible — tant que NEXT_PUBLIC_BLOG_ENABLED n'est
 * pas explicitement "true" (secret/variable d'environnement), /blog et
 * /blog/[slug] renvoient 404 et n'apparaissent ni dans la navbar ni dans le
 * sitemap.
 */
export function isBlogPublic(): boolean {
  return process.env.NEXT_PUBLIC_BLOG_ENABLED === "true";
}
