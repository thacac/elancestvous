import Image from "next/image";

interface CitationProps {
  text: string;
  author?: string;
  imageSrc?: string;
  imageAlt?: string;
}

// Story 4.3 : citation de Coralie sur une carte pêche, en bleu nuit (≈ 16:1)
// — l'ancien gris (#93999b) ne faisait que 2.9:1. La vraie photo de
// Coralie est une exception admise au « tout en dessin » (DESIGN.md).
export default function Citation({ text, author, imageSrc = "/coralie.png", imageAlt = "Coach Coralie" }: CitationProps) {
  return (
    <figure className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-3xl bg-peach px-6 py-8 text-center md:px-10">
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={80}
        height={80}
        className="size-20 rounded-full border-4 border-white object-cover"
      />
      <blockquote className="font-display text-lg font-bold italic leading-snug text-primary md:text-xl">
        &quot;{text}&quot;
      </blockquote>
      {author && <figcaption className="font-display font-bold text-primary">{author}</figcaption>}
    </figure>
  );
}
