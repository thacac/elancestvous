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
      {/* Lecture en Nunito Sans ; intertitres h2/h3 aux tailles de l'échelle
          globale (globals.css, hors @layer, l'emporte sur `prose`). */}
      <div
        className="prose prose-lg prose-stone max-w-none font-sans"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {keyMessage && <KeyMessage className="mt-10">{keyMessage}</KeyMessage>}
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2 mt-10">
          {tags.map((tag) => (
            // Pastille d'étiquette, jamais un bouton (DESIGN.md).
            <li key={tag} className="texte-mention bg-sky text-primary rounded-full px-3 py-1">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
