import { describe, expect, it } from "vitest";

import { getAllPostsMeta } from "../blog";

// Messages clés (« À retenir ») des articles publiés, ajoutés à la main
// (suite de la Story 4.5) : le générateur n'écrit jamais `keyMessage`, donc
// un futur article publié automatiquement n'en aura pas. On n'exige le champ
// que des articles listés ici, jamais de tous, sinon la prochaine
// publication automatique ferait échouer ce test sur master.
const SLUGS_WITH_KEY_MESSAGE = [
  "apres-formation-rps-six-semaines-ancrage-service-de-soins",
  "cadres-de-sante-5-reflexes-formation-charge-psychique-equipe",
  "gapp-supervision-debriefing-equipe-de-soin",
  "je-n-en-peux-plus-72-heures-apres-alerte-soignant",
  "obligation-securite-rps-service-de-soins",
  "qvct-par-ou-commencer-etablissement-sante",
  "reconnaitre-signes-epuisement-professionnel-soignants",
  "tracer-signaux-alerte-burn-out-equipe-soignante",
];

// Au-delà, la bulle ne tient plus proprement à 320 px de large.
const MAX_KEY_MESSAGE_LENGTH = 160;

describe("messages clés des articles publiés (content/blog)", () => {
  const posts = getAllPostsMeta();

  it.each(SLUGS_WITH_KEY_MESSAGE)("l'article %s a un message clé", (slug) => {
    const post = posts.find((p) => p.slug === slug);
    expect(post, `article introuvable : ${slug}`).toBeDefined();
    expect(post?.keyMessage?.trim()).toBeTruthy();
  });

  it(`chaque message clé présent est non vide et fait ${MAX_KEY_MESSAGE_LENGTH} caractères au plus`, () => {
    for (const post of posts) {
      if (post.keyMessage === undefined) continue;
      expect(post.keyMessage.trim(), post.slug).not.toBe("");
      expect(
        [...post.keyMessage].length,
        `${post.slug} : ${[...post.keyMessage].length} caractères`,
      ).toBeLessThanOrEqual(MAX_KEY_MESSAGE_LENGTH);
    }
  });

  // Typographie française : espace insécable (U+00A0) avant « : » et à
  // l'intérieur des guillemets « », pour qu'un deux-points ou un guillemet ne
  // se retrouve jamais seul en début ou en fin de ligne dans la bulle.
  it("chaque message clé garde ses deux-points et guillemets attachés (espaces insécables)", () => {
    for (const post of posts) {
      if (post.keyMessage === undefined) continue;
      expect(post.keyMessage, post.slug).not.toMatch(/ [:»]|« /);
    }
  });
});
