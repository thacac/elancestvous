/**
 * Encode le fichier JSON d'un compte de service Google en base64, pour le
 * secret GitHub Actions GSC_SERVICE_ACCOUNT_JSON (voir
 * docs/blog-search-console-reports/README.md) — le JSON brut ne traverse
 * pas fiablement un copier-coller manuel (deux incidents réels : retours à
 * la ligne réintroduits puis base64 de la clé corrompu par une "correction"
 * à la main), le base64 le traverse sans dommage.
 *
 * Usage : yarn blog:encode-service-account /chemin/vers/le-fichier.json
 * Affiche le résultat sur stdout — jamais écrit dans un fichier, jamais
 * ouvert dans un éditeur : copier directement la sortie de la commande.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function requireFilePathArg(argv: string[]): string {
  const filePath = argv[2];
  if (!filePath) {
    throw new Error("Usage : yarn blog:encode-service-account /chemin/vers/le-fichier.json");
  }
  return filePath;
}

// Extrait en fonction pure testable sans I/O disque : c'est justement le
// choix de l'encodage ("base64", pas "utf8"/"binary") qui protège le
// contenu (retours à la ligne, octets bruts de la clé RSA) de toute
// corruption — une régression silencieuse ici referait apparaître
// exactement le bug que ce script existe pour éviter.
export function encodeToBase64(fileContents: Buffer): string {
  return fileContents.toString("base64");
}

async function main() {
  const filePath = requireFilePathArg(process.argv);
  console.log(encodeToBase64(readFileSync(filePath)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
