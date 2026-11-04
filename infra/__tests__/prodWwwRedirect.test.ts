import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

// Redirection www → apex de la prod (middleware Traefik `www-to-apex`).
// Constat de l'audit Search Console du 04/11/2026 : https://www.elancestvous.fr
// répondait 200 au lieu de rediriger (le site était servi en double, et la
// version www captait la majorité des impressions). Cause : dans un label
// YAML non entre guillemets, `\\.` est transmis tel quel à Traefik, qui
// cherchait alors un antislash littéral dans l'URL — la regex ne
// correspondait jamais.
const compose = readFileSync(resolve(process.cwd(), "docker-compose.yaml"), "utf8");

function label(key: string): string {
  const line = compose.split("\n").find((l) => l.trim().startsWith(`- ${key}=`));
  if (!line) throw new Error(`Label introuvable : ${key}`);
  return line.trim().slice(`- ${key}=`.length);
}

// Valeur reçue par Traefik : le scalaire YAML non entre guillemets est pris
// tel quel (aucun échappement), puis Docker Compose remplace `$$` par `$`.
function traefikValue(key: string): string {
  const raw = label(key);
  expect(raw, "le label doit rester non entre guillemets").not.toMatch(/^["']/);
  return raw.replace(/\$\$/g, "$");
}

// Application de la regex comme le fait Traefik (Go regexp, mêmes règles que
// JavaScript pour ce motif ; `${1}` = premier groupe capturé).
function redirect(url: string): string | null {
  const regex = new RegExp(traefikValue("traefik.http.middlewares.www-to-apex.redirectregex.regex"));
  const replacement = traefikValue("traefik.http.middlewares.www-to-apex.redirectregex.replacement");
  const match = url.match(regex);
  if (!match) return null;
  return url.replace(regex, replacement.replace(/\$\{(\d+)\}/g, "$$$1"));
}

describe("docker-compose.yaml — redirection www → apex", () => {
  it("applique le middleware au router www", () => {
    expect(label("traefik.http.routers.elancestvous-www.rule")).toBe("Host(`www.elancestvous.fr`)");
    expect(label("traefik.http.routers.elancestvous-www.middlewares")).toBe("www-to-apex");
    expect(label("traefik.http.middlewares.www-to-apex.redirectregex.permanent")).toBe("true");
  });

  it.each([
    ["https://www.elancestvous.fr/", "https://elancestvous.fr/"],
    ["https://www.elancestvous.fr/a-propos", "https://elancestvous.fr/a-propos"],
    [
      "https://www.elancestvous.fr/formations/cadre-legal-etablissements-sante?x=1",
      "https://elancestvous.fr/formations/cadre-legal-etablissements-sante?x=1",
    ],
  ])("redirige %s vers %s", (from, to) => {
    expect(redirect(from)).toBe(to);
  });

  it("ne touche pas aux URLs déjà sur l'apex", () => {
    expect(redirect("https://elancestvous.fr/a-propos")).toBeNull();
  });
});
