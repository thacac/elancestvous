/**
 * Bascule de lancement public du blog. Désactivée par défaut : le code, les
 * routes et la génération IA (zone de relecture) peuvent avancer et être
 * mergés sans rendre /blog visible — tant que BLOG_ENABLED n'est pas
 * explicitement "true" (secret/variable d'environnement), /blog et
 * /blog/[slug] renvoient 404 et n'apparaissent ni dans la navbar ni dans le
 * sitemap.
 *
 * Volontairement SANS préfixe `NEXT_PUBLIC_` : cette fonction n'est appelée
 * que côté serveur (routes, `sitemap.ts`, `robots.ts`, `app/layout.tsx`) qui
 * calcule un booléen transmis en prop au composant client `Navbar`. Un
 * préfixe `NEXT_PUBLIC_` aurait fait inliner sa valeur dans le bundle client
 * au moment du `next build` (qui tourne dans l'image Docker, avant que le
 * secret ne soit écrit dans `.env` sur le VPS) — la navbar aurait alors
 * ignoré silencieusement tout changement de ce secret. Basculer ce flag
 * reste donc sans changement de code, mais nécessite malgré tout un nouveau
 * build/déploiement (ex. `workflow_dispatch` sur `deploy.yml`) : ce n'est
 * pas un réglage "live" au sens strict.
 */
export function isBlogPublic(): boolean {
  return process.env.BLOG_ENABLED === "true";
}
