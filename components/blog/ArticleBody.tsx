import { KeyMessage } from "@/components/charte";

interface ArticleBodyProps {
  /** HTML déjà assaini (renderMarkdownToSafeHtml). */
  html: string;
  keyMessage?: string;
  tags: string[];
}

// Corps d'un article de blog, partagé par la page publiée (/blog/[slug]) et
// l'aperçu de relecture Discord (/blog-review/[slug]) : le brouillon relu
// s'affiche exactement comme il sera publié.
export function ArticleBody({ html, keyMessage, tags }: ArticleBodyProps) {
  return (
    <>
      {/* Lecture en Nunito Sans. Les règles globales h2/h3 de globals.css
          sont hors @layer : le h3 y est gris, centré et limité en largeur,
          d'où les modificateurs `!` pour les intertitres générés. */}
      <div
        className="prose prose-stone max-w-none font-sans prose-headings:font-display prose-headings:text-primary prose-h3:mx-0! prose-h3:max-w-none! prose-h3:font-display! prose-h3:text-xl! prose-h3:font-extrabold! prose-h3:text-primary!"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {keyMessage && <KeyMessage className="mt-10">{keyMessage}</KeyMessage>}
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2 mt-10">
          {tags.map((tag) => (
            // Pastille d'étiquette, jamais un bouton (DESIGN.md).
            <li key={tag} className="text-xs bg-sky text-primary rounded-full px-3 py-1">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
